import { Prisma } from '@prisma/client'
import { Order } from '../../../domain/entities/order.entity'
import type { OrderItemEntity, OrderCustomerEntity, OrderStatus, PaymentStatus, FulfillmentStatus } from '../../../domain/entities/order.entity'

type OrderWithRelations = Prisma.OrderGetPayload<{ include: { items: true; customer: true } }>

export function toOrderItem(i: Prisma.OrderItemGetPayload<object>): OrderItemEntity {
  return {
    id: i.id,
    orderId: i.orderId,
    variantId: i.variantId,
    title: i.title,
    sku: i.sku,
    quantity: i.quantity,
    unitPrice: Number(i.unitPrice),
    total: Number(i.total),
    productSnapshot: i.productSnapshot as Record<string, unknown> | null,
  }
}

export function toOrderCustomer(c: Prisma.CustomerGetPayload<object>): OrderCustomerEntity {
  return { id: c.id, email: c.email, firstName: c.firstName, lastName: c.lastName }
}

export function toOrder(o: OrderWithRelations): Order {
  return new Order({
    id: o.id,
    storeId: o.storeId,
    customerId: o.customerId,
    orderNumber: o.orderNumber,
    status: o.status as OrderStatus,
    paymentStatus: o.paymentStatus as PaymentStatus,
    fulfillmentStatus: o.fulfillmentStatus as FulfillmentStatus,
    source: o.source,
    currency: o.currency,
    subtotal: Number(o.subtotal),
    discountTotal: Number(o.discountTotal),
    taxTotal: Number(o.taxTotal),
    shippingTotal: Number(o.shippingTotal),
    total: Number(o.total),
    shippingAddress: o.shippingAddress as Record<string, unknown> | null,
    stripePaymentIntentId: o.stripePaymentIntentId,
    stripeSessionId: o.stripeSessionId,
    paymentEventAt: o.paymentEventAt,
    version: o.version,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    customer: o.customer ? toOrderCustomer(o.customer) : null,
    items: o.items.map(toOrderItem),
  })
}
