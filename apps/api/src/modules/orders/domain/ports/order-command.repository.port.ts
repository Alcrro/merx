import type { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '../entities/order.entity'
import type { CreateOrderData } from '../types'

export interface IOrderCommandRepository {
  create(storeId: string, data: CreateOrderData): Promise<Order>
  updateStatus(id: string, storeId: string, status: OrderStatus): Promise<Order>
  updatePaymentStatus(id: string, storeId: string, paymentStatus: PaymentStatus): Promise<Order>
  updateFulfillmentStatus(id: string, storeId: string, fulfillmentStatus: FulfillmentStatus): Promise<Order>
}
