import { Queue, Worker } from 'bullmq'
import { createRedisConnection } from '../../../../lib/redis'
import { prisma } from '../../../../lib/prisma'
import { stripe } from '../../../../lib/stripe'
import type { InventoryReservationService } from '../../application/services/inventory-reservation.service'
import type { OrderEventRepository } from '../db/order-event.repository'

const QUEUE_NAME = 'orders'
const JOB_NAME = 'expire-pending-payment'
const EXPIRE_DELAY_MS = 30 * 60 * 1000

interface JobData {
  orderId: string
  stripePaymentIntentId: string | null
}

let expireQueue: Queue | null = null

export function getExpirePendingPaymentQueue(): Queue {
  if (!expireQueue) {
    expireQueue = new Queue(QUEUE_NAME, { connection: createRedisConnection() })
  }
  return expireQueue
}

export async function scheduleExpirePendingPayment(orderId: string, stripePaymentIntentId: string | null): Promise<void> {
  await getExpirePendingPaymentQueue().add(
    JOB_NAME,
    { orderId, stripePaymentIntentId } satisfies JobData,
    {
      jobId: `expire-${orderId}`,
      delay: EXPIRE_DELAY_MS,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    },
  )
}

export async function executeExpiry(
  data: JobData,
  deps: { inventoryReservationService: InventoryReservationService; orderEventRepo: OrderEventRepository },
): Promise<void> {
  const { orderId, stripePaymentIntentId } = data
  const { inventoryReservationService, orderEventRepo } = deps

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order || order.paymentStatus !== 'PENDING') return

  // Stripe says payment succeeded — webhook was delayed or lost
  if (stripePaymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId)
      if (paymentIntent.status === 'succeeded') {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: orderId, version: order.version },
            data: { paymentStatus: 'PAID', version: { increment: 1 } },
          })
          await inventoryReservationService.confirm(tx, orderId)
          await orderEventRepo.create(tx, {
            orderId,
            eventType: 'payment.confirmed',
            fromState: order.paymentStatus,
            toState: 'PAID',
            actorType: 'system',
            metadata: { source: 'expire_job_fallback' },
          })
        })
        return
      }
    } catch (err) {
      console.error(`[expire-pending-payment] Stripe check failed for order ${orderId}:`, err)
    }
  }

  // Payment not completed — cancel the order and release reservation
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId, version: order.version },
      data: { paymentStatus: 'VOID', status: 'CANCELLED', version: { increment: 1 } },
    })

    await inventoryReservationService.release(tx, orderId)

    await orderEventRepo.create(tx, {
      orderId,
      eventType: 'order.auto_cancelled',
      fromState: 'ACTIVE',
      toState: 'CANCELLED',
      actorType: 'system',
    })
  })
}

export function startExpirePendingPaymentWorker(
  inventoryReservationService: InventoryReservationService,
  orderEventRepo: OrderEventRepository,
): void {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      if (job.name !== JOB_NAME) return
      await executeExpiry(job.data as JobData, { inventoryReservationService, orderEventRepo })
    },
    { connection: createRedisConnection() },
  )

  worker.on('failed', (job, err) => {
    console.error(`[expire-pending-payment] job ${job?.id ?? 'unknown'} failed:`, err)
  })
}
