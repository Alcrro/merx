import type { Order } from '../domain/entities/order.entity'
import type { ListOrdersParams, PaginatedOrders } from '../domain/types'

export interface IOrderQueryRepository {
  list(params: ListOrdersParams): Promise<PaginatedOrders>
  findById(id: string, storeId: string): Promise<Order | null>
  findByOrderNumber(orderNumber: number, storeId: string): Promise<Order | null>
  findStripeSessionId(id: string, storeId: string): Promise<string | null>
}
