import { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import type { IOrderRepository, CreateOrderData } from '../domain/ports'
import type {
  OrderEntity,
  OrderItemEntity,
  OrderCustomerEntity,
  ListOrdersParams,
  PaginatedOrders,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from '../domain/entities'

type OrderWithRelations = Prisma.OrderGetPayload<{ include: { items: true; customer: true } }>

function toItem(i: Prisma.OrderItemGetPayload<object>): OrderItemEntity {
  return {
    ...i,
    unitPrice: Number(i.unitPrice),
    total: Number(i.total),
  }
}

function toCustomer(c: Prisma.CustomerGetPayload<object>): OrderCustomerEntity {
  return { id: c.id, email: c.email, firstName: c.firstName, lastName: c.lastName }
}

function toOrder(o: OrderWithRelations): OrderEntity {
  const { metadata: _m, ...rest } = o
  return {
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
    customer: o.customer ? toCustomer(o.customer) : null,
    items: o.items.map(toItem),
  }
}

const include = { items: true, customer: true } as const

export class OrderRepository implements IOrderRepository {
  async list(params: ListOrdersParams): Promise<PaginatedOrders> {
    const { storeId, status, paymentStatus, fulfillmentStatus, startDate, endDate, page, limit } = params
    const where: Prisma.OrderWhereInput = {
      storeId,
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(fulfillmentStatus && { fulfillmentStatus }),
      ...(startDate ?? endDate
        ? {
            createdAt: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(`${endDate}T23:59:59.999Z`) }),
            },
          }
        : {}),
    }

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return { data: data.map(toOrder), total, page, limit }
  }

  async findById(id: string, storeId: string): Promise<OrderEntity | null> {
    const o = await prisma.order.findFirst({ where: { id, storeId }, include })
    return o ? toOrder(o) : null
  }

  async create(storeId: string, data: CreateOrderData): Promise<OrderEntity> {
    const discountTotal = data.discountTotal ?? 0
    const taxTotal = data.taxTotal ?? 0
    const shippingTotal = data.shippingTotal ?? 0
    const subtotal = data.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const total = subtotal + shippingTotal + taxTotal - discountTotal

    const o = await prisma.order.create({
      include,
      data: {
        storeId,
        customerId: data.customerId ?? null,
        currency: data.currency,
        subtotal,
        discountTotal,
        taxTotal,
        shippingTotal,
        total,
        shippingAddress: (data.shippingAddress ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        items: {
          create: data.items.map((item) => ({
            variantId: item.variantId ?? null,
            title: item.title,
            sku: item.sku ?? null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.unitPrice * item.quantity,
          })),
        },
      },
    })

    return toOrder(o)
  }

  async updateStatus(id: string, storeId: string, status: OrderStatus): Promise<OrderEntity> {
    const o = await prisma.order.update({ where: { id }, data: { status }, include })
    return toOrder(o)
  }

  async updatePaymentStatus(id: string, storeId: string, paymentStatus: PaymentStatus): Promise<OrderEntity> {
    const o = await prisma.order.update({ where: { id }, data: { paymentStatus }, include })
    return toOrder(o)
  }

  async updateFulfillmentStatus(id: string, storeId: string, fulfillmentStatus: FulfillmentStatus): Promise<OrderEntity> {
    const o = await prisma.order.update({ where: { id }, data: { fulfillmentStatus }, include })
    return toOrder(o)
  }
}
