import type { OrderStatus, PaymentStatus, FulfillmentStatus } from '../../domain/entities/order.entity'

export interface OrderItemDto {
  id: string
  orderId: string
  variantId: string | null
  title: string
  sku: string | null
  quantity: number
  unitPrice: number
  total: number
}

export interface OrderCustomerDto {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
}

export interface OrderResponseDto {
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
  createdAt: string
  updatedAt: string
  customer: OrderCustomerDto | null
  items: OrderItemDto[]
}
