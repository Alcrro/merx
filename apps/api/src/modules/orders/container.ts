import Stripe from 'stripe'
import { config } from '../../config'
import { OrderRepository } from './infrastructure/db/order.repository'
import { NotificationService } from '../notifications/application/notification.service'
import { NotificationRepository } from '../notifications/infrastructure/notification.repository'
import { OrderQuery } from './application/queries/order.query'
import { OrderService } from './application/services/order.service'
import { CancelOrderUseCase } from './application/use-cases/cancel-order.use-case'
import { RefundOrderUseCase } from './application/use-cases/refund-order.use-case'
import { OrderError } from './domain/errors'
import type { Order } from './domain/entities/order.entity'

const orderRepository = new OrderRepository()
const notificationService = new NotificationService(new NotificationRepository())
const stripe = new Stripe(config.stripe.secretKey)

async function notifyCancel(order: Order): Promise<void> {
  notificationService.create({
    storeId: order.storeId,
    type: 'ORDER_CANCELLED',
    severity: 'WARNING',
    title: `Comandă anulată #${order.orderNumber}`,
    message: order.customer?.email
      ? `Comanda lui ${order.customer.email} a fost anulată`
      : `Comanda #${order.orderNumber} a fost anulată`,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderCreatedAt: order.createdAt.toISOString(),
      customerEmail: order.customer?.email ?? null,
      total: order.total,
    },
  }).catch(() => {})
}

async function notifyRefund(order: Order, amount: number, isPartial: boolean): Promise<void> {
  notificationService.create({
    storeId: order.storeId,
    type: 'REFUND_PROCESSED',
    severity: 'INFO',
    title: `Rambursare procesată #${order.orderNumber}`,
    message: `${isPartial ? 'Parțial' : 'Total'} — ${amount.toFixed(2)} ${order.currency}`,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount,
      partial: isPartial,
      customerEmail: order.customer?.email ?? null,
    },
  }).catch(() => {})
}

async function processRefund(orderId: string, storeId: string, amount: number, isPartial: boolean): Promise<void> {
  const stripeSessionId = await orderRepository.findStripeSessionId(orderId, storeId)

  if (!stripeSessionId || stripeSessionId.startsWith('orphan_')) return

  try {
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId)
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id

    if (paymentIntentId) {
      await stripe.refunds.create({
        payment_intent: paymentIntentId,
        ...(isPartial ? { amount: Math.round(amount * 100) } : {}),
      })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Stripe refund failed'
    throw OrderError.stripeError(msg)
  }
}

export const orderQuery = new OrderQuery(orderRepository)
export const orderService = new OrderService(orderRepository, orderRepository)
export const cancelOrderUseCase = new CancelOrderUseCase(orderRepository, orderRepository, notifyCancel)
export const refundOrderUseCase = new RefundOrderUseCase(orderRepository, orderRepository, processRefund, notifyRefund)
