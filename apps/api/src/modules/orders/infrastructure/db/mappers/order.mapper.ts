import { Prisma } from '@prisma/client'
import { Order } from '../../../domain/entities/order.entity'
import type { OrderItemEntity, OrderCustomerEntity, OrderStatus, PaymentStatus, FulfillmentStatus } from '../../../domain/entities/order.entity'

type OrderWithRelations = Prisma.OrderGetPayload<{ include: { items: true; customer: true } }>

export function toOrderItem(i: Prisma.OrderItemGetPayload<object>): OrderItemEntity {
  return {
    ...i,
    unitPrice: Number(i.unitPrice),
    total: Number(i.total),
  }
}

export function toOrderCustomer(c: Prisma.CustomerGetPayload<object>): OrderCustomerEntity {
  return { id: c.id, email: c.email, firstName: c.firstName, lastName: c.lastName }
}

export function toOrder(o: OrderWithRelations): Order {
  const { metadata: _m, ...rest } = o
  return new Order({
    ...rest,
    status: o.status as OrderStatus,
    paymentStatus: o.paymentStatus as PaymentStatus,
    fulfillmentStatus: o.fulfillmentStatus as FulfillmentStatus,
    subtotal: Number(o.subtotal),
    discountTotal: Number(o.discountTotal),
    taxTotal: Number(o.taxTotal),
    shippingTotal: Number(o.shippingTotal),
    total: Number(o.total),
    shippingAddress: o.shippingAddress as Record<string, unknown> | null,
    customer: o.customer ? toOrderCustomer(o.customer) : null,
    items: o.items.map(toOrderItem),
  })
}
