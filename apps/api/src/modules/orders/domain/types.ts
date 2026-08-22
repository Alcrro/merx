import type { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from './entities/order.entity'

export interface CreateOrderItemData {
  variantId?: string | null
  title: string
  sku?: string | null
  quantity: number
  unitPrice: number
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
