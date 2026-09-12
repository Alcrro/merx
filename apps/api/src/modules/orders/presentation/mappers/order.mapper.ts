import type { Order } from '../../domain/entities/order.entity'
import type { DisplayStatus } from '../../domain/types'
import type { OrderResponseDto } from '../dto/order.dto'

export function getDisplayStatus(order: Pick<Order, 'status' | 'paymentStatus' | 'fulfillmentStatus'>): DisplayStatus {
  if (order.status === 'CANCELLED') return 'CANCELLED'
  if (order.status === 'COMPLETED') return 'COMPLETED'

  switch (order.paymentStatus) {
    case 'PENDING':        return 'AWAITING_PAYMENT'
    case 'AUTHORIZED':     return 'PAYMENT_AUTHORIZED'
    case 'PAYMENT_FAILED': return 'PAYMENT_FAILED'
  }

  switch (order.fulfillmentStatus) {
    case 'PROCESSING':      return 'PROCESSING'
    case 'SHIPPED':         return 'SHIPPED'
    case 'LOST_IN_TRANSIT': return 'LOST_IN_TRANSIT'
    case 'DELIVERED':       return 'DELIVERED'
  }

  return 'CONFIRMED'
}

export function toOrderResponse(order: Order): OrderResponseDto {
  return {
    id: order.id,
    storeId: order.storeId,
    customerId: order.customerId,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    displayStatus: getDisplayStatus(order),
    source: order.source,
    currency: order.currency,
    subtotal: order.subtotal,
    discountTotal: order.discountTotal,
    taxTotal: order.taxTotal,
    shippingTotal: order.shippingTotal,
    total: order.total,
    shippingAddress: order.shippingAddress,
    stripePaymentIntentId: order.stripePaymentIntentId,
    stripeSessionId: order.stripeSessionId,
    paymentEventAt: order.paymentEventAt?.toISOString() ?? null,
    version: order.version,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    customer: order.customer,
    items: order.items.map((i) => ({
      id: i.id,
      orderId: i.orderId,
      variantId: i.variantId,
      title: i.title,
      sku: i.sku,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.total,
      productSnapshot: i.productSnapshot,
    })),
  }
}
