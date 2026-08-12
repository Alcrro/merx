import type { IOrderRepository, CreateOrderData } from '../domain/ports'
import type {
  OrderEntity,
  ListOrdersParams,
  PaginatedOrders,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
} from '../domain/entities'

export class OrderError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'CONFLICT' | 'INVALID' | 'FORBIDDEN'
  ) {
    super(message)
    this.name = 'OrderError'
  }
}

export class OrderService {
  constructor(private readonly repo: IOrderRepository) {}

  list(params: ListOrdersParams): Promise<PaginatedOrders> {
    return this.repo.list(params)
  }

  async get(id: string, storeId: string): Promise<OrderEntity> {
    const order = await this.repo.findById(id, storeId)
    if (!order) throw new OrderError('Order not found', 'NOT_FOUND')
    return order
  }

  async create(storeId: string, data: CreateOrderData): Promise<OrderEntity> {
    if (data.items.length === 0) {
      throw new OrderError('Order must have at least one item', 'INVALID')
    }
    for (const item of data.items) {
      if (item.quantity <= 0) throw new OrderError('Item quantity must be positive', 'INVALID')
      if (item.unitPrice < 0) throw new OrderError('Item price cannot be negative', 'INVALID')
    }
    return this.repo.create(storeId, data)
  }

  async updateStatus(id: string, storeId: string, status: OrderStatus): Promise<OrderEntity> {
    const order = await this.repo.findById(id, storeId)
    if (!order) throw new OrderError('Order not found', 'NOT_FOUND')
    if (order.status === 'cancelled') {
      throw new OrderError('Cannot change status of a cancelled order', 'CONFLICT')
    }
    if (order.status === 'completed' && status !== 'completed') {
      throw new OrderError('Cannot revert a completed order', 'CONFLICT')
    }
    return this.repo.updateStatus(id, storeId, status)
  }

  async updatePaymentStatus(id: string, storeId: string, paymentStatus: PaymentStatus): Promise<OrderEntity> {
    const order = await this.repo.findById(id, storeId)
    if (!order) throw new OrderError('Order not found', 'NOT_FOUND')
    if (order.status === 'cancelled') {
      throw new OrderError('Cannot update payment on a cancelled order', 'CONFLICT')
    }
    return this.repo.updatePaymentStatus(id, storeId, paymentStatus)
  }

  async updateFulfillmentStatus(id: string, storeId: string, fulfillmentStatus: FulfillmentStatus): Promise<OrderEntity> {
    const order = await this.repo.findById(id, storeId)
    if (!order) throw new OrderError('Order not found', 'NOT_FOUND')
    if (order.status === 'cancelled') {
      throw new OrderError('Cannot update fulfillment on a cancelled order', 'CONFLICT')
    }
    return this.repo.updateFulfillmentStatus(id, storeId, fulfillmentStatus)
  }

  async cancel(id: string, storeId: string): Promise<OrderEntity> {
    const order = await this.repo.findById(id, storeId)
    if (!order) throw new OrderError('Order not found', 'NOT_FOUND')
    if (order.status === 'cancelled') {
      throw new OrderError('Order is already cancelled', 'CONFLICT')
    }
    if (order.status === 'completed') {
      throw new OrderError('Cannot cancel a completed order', 'CONFLICT')
    }
    return this.repo.updateStatus(id, storeId, 'cancelled')
  }
}
