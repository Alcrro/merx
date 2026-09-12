import type Stripe from 'stripe'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../../../lib/prisma'
import { canTransition, PAYMENT_TRANSITIONS } from '../../domain/types'
import type { ProcessedWebhookRepository } from '../../infrastructure/db/processed-webhook.repository'
import type { OrderEventRepository } from '../../infrastructure/db/order-event.repository'
import type { InventoryReservationService } from './inventory-reservation.service'

export type ScheduleEmailFn = (orderId: string) => Promise<void>

export class OrderWebhookService {
  constructor(
    private readonly processedWebhookRepo: ProcessedWebhookRepository,
    private readonly orderEventRepo: OrderEventRepository,
    private readonly inventoryReservationService: InventoryReservationService,
    private readonly scheduleEmail: ScheduleEmailFn,
  ) {}

  async handleStripeEvent(event: Stripe.Event): Promise<void> {
    const alreadyProcessed = await this.processedWebhookRepo.exists(event.id)
    if (alreadyProcessed) return

    await prisma.$transaction(async (tx) => {
      await this.processedWebhookRepo.create(tx, event.id)

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(tx, event.data.object as Stripe.PaymentIntent, event)
          break
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(tx, event.data.object as Stripe.PaymentIntent, event)
          break
      }
    })
  }

  private async handlePaymentSuccess(
    tx: Prisma.TransactionClient,
    paymentIntent: Stripe.PaymentIntent,
    event: Stripe.Event,
  ): Promise<void> {
    const eventCreatedAt = new Date(event.created * 1000)
    const order = await tx.order.findUnique({ where: { stripePaymentIntentId: paymentIntent.id } })

    if (!order) return
    if (order.paymentEventAt && eventCreatedAt <= order.paymentEventAt) return
    if (!canTransition(PAYMENT_TRANSITIONS, order.paymentStatus, 'PAID')) return

    await tx.order.update({
      where: { id: order.id, version: order.version },
      data: { paymentStatus: 'PAID', paymentEventAt: eventCreatedAt, version: { increment: 1 } },
    })

    await this.inventoryReservationService.confirm(tx, order.id)

    await this.orderEventRepo.create(tx, {
      orderId: order.id,
      eventType: 'payment.confirmed',
      fromState: order.paymentStatus,
      toState: 'PAID',
      actorType: 'stripe_webhook',
    })

    void this.scheduleEmail(order.id)
  }

  private async handlePaymentFailed(
    tx: Prisma.TransactionClient,
    paymentIntent: Stripe.PaymentIntent,
    event: Stripe.Event,
  ): Promise<void> {
    const eventCreatedAt = new Date(event.created * 1000)
    const order = await tx.order.findUnique({ where: { stripePaymentIntentId: paymentIntent.id } })

    if (!order) return
    if (order.paymentEventAt && eventCreatedAt <= order.paymentEventAt) return
    if (!canTransition(PAYMENT_TRANSITIONS, order.paymentStatus, 'PAYMENT_FAILED')) return

    await tx.order.update({
      where: { id: order.id, version: order.version },
      data: { paymentStatus: 'PAYMENT_FAILED', paymentEventAt: eventCreatedAt, version: { increment: 1 } },
    })

    await this.orderEventRepo.create(tx, {
      orderId: order.id,
      eventType: 'payment.failed',
      fromState: order.paymentStatus,
      toState: 'PAYMENT_FAILED',
      actorType: 'stripe_webhook',
    })
  }
}
