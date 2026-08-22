import type { IOrderQueryRepository } from '../ports'
import type { IOrderCommandRepository } from '../../domain/ports/order-command.repository.port'
import type { Order, PaymentStatus } from '../../domain/entities/order.entity'
import { OrderError } from '../../domain/errors'

export type NotifyRefundFn = (order: Order, amount: number, isPartial: boolean) => Promise<void>
export type ProcessRefundFn = (orderId: string, storeId: string, amount: number, isPartial: boolean) => Promise<void>

export class RefundOrderUseCase {
  constructor(
    private readonly queryRepo: IOrderQueryRepository,
    private readonly commandRepo: IOrderCommandRepository,
    private readonly processRefund: ProcessRefundFn,
    private readonly notifyRefund: NotifyRefundFn,
  ) {}

  async execute(id: string, storeId: string, amount?: number): Promise<Order> {
    const order = await this.queryRepo.findById(id, storeId)
    if (!order) throw OrderError.notFound('Order not found')
    order.guardCanRefund()

    if (amount !== undefined && amount > order.total) {
      throw OrderError.invalid('Refund amount cannot exceed order total')
    }

    const refundAmount = amount ?? order.total
    const isPartial = amount != null && amount < order.total

    await this.processRefund(id, storeId, refundAmount, isPartial)

    const newPaymentStatus: PaymentStatus = isPartial ? 'partially_refunded' : 'refunded'
    const updated = await this.commandRepo.updatePaymentStatus(id, storeId, newPaymentStatus)
    void this.notifyRefund(order, refundAmount, isPartial)
    return updated
  }
}
