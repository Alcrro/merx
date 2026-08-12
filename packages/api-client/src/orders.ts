import type {
  Order,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  PaginatedResponse,
} from '@merx/types'
import { apiClient } from './index'

export interface ListOrdersParams {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  fulfillmentStatus?: FulfillmentStatus
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface CreateOrderItemInput {
  variantId?: string | null
  title: string
  sku?: string | null
  quantity: number
  unitPrice: number
}

export interface CreateOrderInput {
  customerId?: string | null
  currency: string
  items: CreateOrderItemInput[]
  discountTotal?: number
  taxTotal?: number
  shippingTotal?: number
  shippingAddress?: Record<string, unknown> | null
}

export const orderApi = {
  list: (params?: ListOrdersParams) =>
    apiClient.get<PaginatedResponse<Order>>('/orders', { params }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Order>(`/orders/${id}`).then((r) => r.data),

  create: (data: CreateOrderInput) =>
    apiClient.post<Order>('/orders', data).then((r) => r.data),

  updateStatus: (id: string, status: OrderStatus) =>
    apiClient.patch<Order>(`/orders/${id}/status`, { status }).then((r) => r.data),

  updatePaymentStatus: (id: string, paymentStatus: PaymentStatus) =>
    apiClient.patch<Order>(`/orders/${id}/payment`, { paymentStatus }).then((r) => r.data),

  updateFulfillmentStatus: (id: string, fulfillmentStatus: FulfillmentStatus) =>
    apiClient.patch<Order>(`/orders/${id}/fulfillment`, { fulfillmentStatus }).then((r) => r.data),

  cancel: (id: string) =>
    apiClient.post<Order>(`/orders/${id}/cancel`).then((r) => r.data),
}
