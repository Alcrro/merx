import type { IOrderQueryRepository } from '../ports'
import type { Order } from '../../domain/entities/order.entity'
import type { ListOrdersParams, PaginatedOrders } from '../../domain/types'
import { OrderError } from '../../domain/errors'

export class OrderQuery {
  constructor(private readonly repo: IOrderQueryRepository) {}

  list(params: ListOrdersParams): Promise<PaginatedOrders> {
    return this.repo.list(params)
  }

  async get(id: string, storeId: string): Promise<Order> {
    const order = await this.repo.findById(id, storeId)
    if (!order) throw OrderError.notFound('Order not found')
    return order
  }

  async getBySlug(slug: string, storeId: string): Promise<Order> {
    const m = slug.match(/^ORD-(\d+)-\d{8}$/)
    if (!m) throw OrderError.notFound('Invalid order slug')
    const orderNumber = parseInt(m[1], 10)
    const order = await this.repo.findByOrderNumber(orderNumber, storeId)
    if (!order) throw OrderError.notFound('Order not found')
    return order
  }
}
