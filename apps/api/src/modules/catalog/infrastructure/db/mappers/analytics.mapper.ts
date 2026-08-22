import type { Prisma } from '@prisma/client'
import type { AnalyticsOrder } from '../../../domain/types'

interface RawOrderItem {
  orderId: string
  title: string
  quantity: number
  total: Prisma.Decimal
}

interface RawAnalyticsOrder {
  id: string
  createdAt: Date
  customerId: string | null
  shippingAddress: Prisma.JsonValue
  items: RawOrderItem[]
}

export function toAnalyticsOrder(o: RawAnalyticsOrder): AnalyticsOrder {
  return {
    id: o.id,
    createdAt: o.createdAt,
    customerId: o.customerId,
    shippingAddress: o.shippingAddress as Record<string, string> | null,
    items: o.items.map((i) => ({
      orderId: i.orderId,
      title: i.title,
      quantity: i.quantity,
      total: Number(i.total),
    })),
  }
}
