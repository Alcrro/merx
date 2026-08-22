import type { IOrderQueryRepository } from '../ports'
import type { IOrderCommandRepository } from '../../domain/ports/order-command.repository.port'
import type { Order } from '../../domain/entities/order.entity'
import { OrderError } from '../../domain/errors'

export type NotifyCancelFn = (order: Order) => Promise<void>

export class CancelOrderUseCase {
  constructor(
    private readonly queryRepo: IOrderQueryRepository,
    private readonly commandRepo: IOrderCommandRepository,
    private readonly notifyCancel: NotifyCancelFn,
  ) {}

  async execute(id: string, storeId: string): Promise<Order> {
    const order = await this.queryRepo.findById(id, storeId)
    if (!order) throw OrderError.notFound('Order not found')
    order.guardCanCancel()
    const cancelled = await this.commandRepo.updateStatus(id, storeId, 'cancelled')
    void this.notifyCancel(order)
    return cancelled
  }
}
