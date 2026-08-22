import type { IOrderQueryRepository } from '../ports'
import type { IOrderCommandRepository } from '../../domain/ports/order-command.repository.port'
import type { CreateOrderData } from '../../domain/types'
import type { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '../../domain/entities/order.entity'
import { OrderError } from '../../domain/errors'
import { Money } from '../../domain/value-objects/money.value-object'

export class OrderService {
  constructor(
    private readonly queryRepo: IOrderQueryRepository,
    private readonly commandRepo: IOrderCommandRepository,
  ) {}

  async create(storeId: string, data: CreateOrderData): Promise<Order> {
    if (data.items.length === 0) throw OrderError.invalid('Order must have at least one item')
    for (const item of data.items) {
      if (item.quantity <= 0) throw OrderError.invalid('Item quantity must be positive')
      Money.validate(item.unitPrice)
    }
    return this.commandRepo.create(storeId, data)
  }

  async updateStatus(id: string, storeId: string, status: OrderStatus): Promise<Order> {
    const order = await this.queryRepo.findById(id, storeId)
    if (!order) throw OrderError.notFound('Order not found')
    order.guardCanChangeStatus(status)
    return this.commandRepo.updateStatus(id, storeId, status)
  }

  async updatePaymentStatus(id: string, storeId: string, paymentStatus: PaymentStatus): Promise<Order> {
    const order = await this.queryRepo.findById(id, storeId)
    if (!order) throw OrderError.notFound('Order not found')
    order.guardCanUpdatePayment()
    return this.commandRepo.updatePaymentStatus(id, storeId, paymentStatus)
  }

  async updateFulfillmentStatus(id: string, storeId: string, fulfillmentStatus: FulfillmentStatus): Promise<Order> {
    const order = await this.queryRepo.findById(id, storeId)
    if (!order) throw OrderError.notFound('Order not found')
    order.guardCanUpdateFulfillment()
    return this.commandRepo.updateFulfillmentStatus(id, storeId, fulfillmentStatus)
  }
}
