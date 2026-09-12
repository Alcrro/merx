import { Prisma } from '@prisma/client'
import { prisma } from '../../../../lib/prisma'
import type { IOrderQueryRepository } from '../../application/ports'
import type { IOrderCommandRepository } from '../../domain/ports/order-command.repository.port'
import type { CreateOrderData } from '../../domain/types'
import type { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '../../domain/entities/order.entity'
import type { ListOrdersParams, PaginatedOrders } from '../../domain/types'
import { toOrder } from './mappers/order.mapper'

const include = { items: true, customer: true } as const

export class OrderRepository implements IOrderQueryRepository, IOrderCommandRepository {
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

  async findById(id: string, storeId: string): Promise<Order | null> {
    const o = await prisma.order.findFirst({ where: { id, storeId }, include })
    return o ? toOrder(o) : null
  }

  async findByOrderNumber(orderNumber: number, storeId: string): Promise<Order | null> {
    const o = await prisma.order.findFirst({ where: { orderNumber, storeId }, include })
    return o ? toOrder(o) : null
  }

  async findByStripePaymentIntentId(paymentIntentId: string): Promise<Order | null> {
    const o = await prisma.order.findUnique({ where: { stripePaymentIntentId: paymentIntentId }, include })
    return o ? toOrder(o) : null
  }

  async findStripeSessionId(id: string, storeId: string): Promise<string | null> {
    const raw = await prisma.order.findFirst({ where: { id, storeId }, select: { stripeSessionId: true } })
    return raw?.stripeSessionId ?? null
  }

  async create(storeId: string, data: CreateOrderData): Promise<Order> {
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
            productSnapshot: (item.productSnapshot as Prisma.InputJsonValue | undefined) ?? Prisma.DbNull,
          })),
        },
      },
    })

    return toOrder(o)
  }

  async updateStatus(id: string, storeId: string, status: OrderStatus): Promise<Order> {
    const o = await prisma.order.update({ where: { id, storeId }, data: { status }, include })
    return toOrder(o)
  }

  async updatePaymentStatus(id: string, storeId: string, paymentStatus: PaymentStatus): Promise<Order> {
    const o = await prisma.order.update({ where: { id, storeId }, data: { paymentStatus }, include })
    return toOrder(o)
  }

  async updateFulfillmentStatus(id: string, storeId: string, fulfillmentStatus: FulfillmentStatus): Promise<Order> {
    const o = await prisma.order.update({ where: { id, storeId }, data: { fulfillmentStatus }, include })
    return toOrder(o)
  }
}
