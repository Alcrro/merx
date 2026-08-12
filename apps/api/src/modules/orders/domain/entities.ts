export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partially_refunded'
export type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled'

export interface OrderItemEntity {
  id: string
  orderId: string
  variantId: string | null
  title: string
  sku: string | null
  quantity: number
  unitPrice: number
  total: number
}

export interface OrderCustomerEntity {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
}

export interface OrderEntity {
  id: string
  storeId: string
  customerId: string | null
  orderNumber: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  currency: string
  subtotal: number
  discountTotal: number
  taxTotal: number
  shippingTotal: number
  total: number
  shippingAddress: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
  customer: OrderCustomerEntity | null
  items: OrderItemEntity[]
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
  data: OrderEntity[]
  total: number
  page: number
  limit: number
}
