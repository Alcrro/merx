import type { Order } from './entities/order.entity'
import { OrderError } from './errors'

export type OrderStatus =
  | 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export type PaymentStatus =
  | 'PENDING' | 'AUTHORIZED' | 'PAID' | 'PAYMENT_FAILED'
  | 'VOID' | 'REFUND_PENDING' | 'PARTIALLY_REFUNDED' | 'REFUNDED'

export type FulfillmentStatus =
  | 'UNFULFILLED' | 'PROCESSING' | 'SHIPPED' | 'LOST_IN_TRANSIT'
  | 'DELIVERED' | 'FULFILLED' | 'RETURN_IN_TRANSIT' | 'RETURNED'

export type DisplayStatus =
  | 'AWAITING_PAYMENT' | 'PAYMENT_AUTHORIZED' | 'PAYMENT_FAILED'
  | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'LOST_IN_TRANSIT'
  | 'DELIVERED' | 'CANCELLED' | 'COMPLETED'

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT:     ['ACTIVE', 'CANCELLED'],
  ACTIVE:    ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

export const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING:            ['AUTHORIZED', 'PAID', 'PAYMENT_FAILED', 'VOID'],
  AUTHORIZED:         ['PAID', 'VOID'],
  PAID:               ['REFUND_PENDING', 'PARTIALLY_REFUNDED'],
  PAYMENT_FAILED:     ['PENDING', 'VOID'],
  VOID:               [],
  REFUND_PENDING:     ['REFUNDED', 'PARTIALLY_REFUNDED'],
  PARTIALLY_REFUNDED: ['REFUNDED', 'REFUND_PENDING'],
  REFUNDED:           [],
}

// Tier 0: fără PARTIALLY_FULFILLED
export const FULFILLMENT_TRANSITIONS: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  UNFULFILLED:       ['PROCESSING'],
  PROCESSING:        ['SHIPPED'],
  SHIPPED:           ['DELIVERED', 'LOST_IN_TRANSIT'],
  LOST_IN_TRANSIT:   ['SHIPPED', 'UNFULFILLED'],
  DELIVERED:         ['FULFILLED', 'RETURN_IN_TRANSIT'],
  FULFILLED:         [],
  RETURN_IN_TRANSIT: ['RETURNED'],
  RETURNED:          [],
}

export function canTransition(
  map: Record<string, string[]>,
  from: string,
  to: string,
): boolean {
  return map[from]?.includes(to) ?? false
}

const INVALID_COMBINATIONS: Array<{ status?: string; paymentStatus?: string; fulfillmentStatus?: string }> = [
  { status: 'ACTIVE',    paymentStatus: 'VOID' },
  { status: 'CANCELLED', paymentStatus: 'PAID' },
  { status: 'COMPLETED', fulfillmentStatus: 'UNFULFILLED' },
]

export function validateCombination(
  order: { status: string; paymentStatus: string; fulfillmentStatus: string },
): void {
  for (const rule of INVALID_COMBINATIONS) {
    const match = Object.entries(rule).every(([k, v]) => order[k as keyof typeof rule] === v)
    if (match) throw OrderError.conflict(`Invalid state combination: ${JSON.stringify(rule)}`)
  }
}

export interface CreateOrderItemData {
  variantId?: string | null
  title: string
  sku?: string | null
  quantity: number
  unitPrice: number
  productSnapshot?: Record<string, unknown> | null
}

export interface CreateOrderData {
  customerId?: string | null
  currency: string
  items: CreateOrderItemData[]
  discountTotal?: number
  taxTotal?: number
  shippingTotal?: number
  shippingAddress?: Record<string, unknown> | null
}

export interface ListOrdersParams {
  storeId: string
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  fulfillmentStatus?: FulfillmentStatus
  startDate?: string
  endDate?: string
  page: number
  limit: number
}

export interface PaginatedOrders {
  data: Order[]
  total: number
  page: number
  limit: number
}
