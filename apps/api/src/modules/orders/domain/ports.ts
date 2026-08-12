import type {
  OrderEntity,
  ListOrdersParams,
  PaginatedOrders,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from './entities'

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

export interface IOrderRepository {
  list(params: ListOrdersParams): Promise<PaginatedOrders>
  findById(id: string, storeId: string): Promise<OrderEntity | null>
  create(storeId: string, data: CreateOrderData): Promise<OrderEntity>
  updateStatus(id: string, storeId: string, status: OrderStatus): Promise<OrderEntity>
  updatePaymentStatus(id: string, storeId: string, paymentStatus: PaymentStatus): Promise<OrderEntity>
  updateFulfillmentStatus(id: string, storeId: string, fulfillmentStatus: FulfillmentStatus): Promise<OrderEntity>
}
