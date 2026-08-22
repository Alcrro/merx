import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RefundOrderUseCase } from '../../application/use-cases/refund-order.use-case'
import type { ProcessRefundFn, NotifyRefundFn } from '../../application/use-cases/refund-order.use-case'
import { OrderError } from '../../domain/errors'
import type { IOrderQueryRepository } from '../../application/ports'
import type { IOrderCommandRepository } from '../../domain/ports/order-command.repository.port'
import { makeOrder, makeQueryRepo, makeCommandRepo } from '../fixtures/order.fixtures'

describe('RefundOrderUseCase', () => {
  let queryRepo: IOrderQueryRepository
  let commandRepo: IOrderCommandRepository
  let processRefund: ProcessRefundFn
  let notifyRefund: NotifyRefundFn
  let useCase: RefundOrderUseCase

  beforeEach(() => {
    queryRepo = makeQueryRepo()
    commandRepo = makeCommandRepo()
    processRefund = vi.fn<ProcessRefundFn>().mockResolvedValue(undefined)
    notifyRefund = vi.fn<NotifyRefundFn>().mockResolvedValue(undefined)
    useCase = new RefundOrderUseCase(queryRepo, commandRepo, processRefund, notifyRefund)
  })

  it('throws NOT_FOUND when order missing', async () => {
    vi.mocked(queryRepo.findById).mockResolvedValue(null)
    await expect(useCase.execute('o1', 's1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('throws CONFLICT when already refunded', async () => {
    vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder({ paymentStatus: 'refunded' }))
    await expect(useCase.execute('o1', 's1')).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('throws CONFLICT when not paid', async () => {
    vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder({ paymentStatus: 'pending' }))
    await expect(useCase.execute('o1', 's1')).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('throws INVALID when amount exceeds order total', async () => {
    vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder({ total: 100 }))
    await expect(useCase.execute('o1', 's1', 150)).rejects.toMatchObject({ code: 'INVALID' })
  })

  it('calls processRefund with full amount and isPartial=false when no amount given', async () => {
    vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder({ total: 74.98 }))
    vi.mocked(commandRepo.updatePaymentStatus).mockResolvedValue(makeOrder({ paymentStatus: 'refunded' }))
    await useCase.execute('o1', 's1')
    expect(processRefund).toHaveBeenCalledWith('o1', 's1', 74.98, false)
  })

  it('calls processRefund with isPartial=true when amount < total', async () => {
    vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder({ total: 74.98 }))
    vi.mocked(commandRepo.updatePaymentStatus).mockResolvedValue(makeOrder({ paymentStatus: 'partially_refunded' }))
    await useCase.execute('o1', 's1', 20)
    expect(processRefund).toHaveBeenCalledWith('o1', 's1', 20, true)
  })

  it('sets paymentStatus=partially_refunded for partial refund', async () => {
    vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder({ total: 74.98 }))
    vi.mocked(commandRepo.updatePaymentStatus).mockResolvedValue(makeOrder({ paymentStatus: 'partially_refunded' }))
    await useCase.execute('o1', 's1', 20)
    expect(commandRepo.updatePaymentStatus).toHaveBeenCalledWith('o1', 's1', 'partially_refunded')
  })

  it('sets paymentStatus=refunded for full refund', async () => {
    vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder({ total: 74.98 }))
    vi.mocked(commandRepo.updatePaymentStatus).mockResolvedValue(makeOrder({ paymentStatus: 'refunded' }))
    await useCase.execute('o1', 's1')
    expect(commandRepo.updatePaymentStatus).toHaveBeenCalledWith('o1', 's1', 'refunded')
  })

  it('fires notifyRefund after successful refund', async () => {
    const order = makeOrder({ total: 74.98 })
    vi.mocked(queryRepo.findById).mockResolvedValue(order)
    vi.mocked(commandRepo.updatePaymentStatus).mockResolvedValue(makeOrder({ paymentStatus: 'refunded' }))
    await useCase.execute('o1', 's1')
    expect(notifyRefund).toHaveBeenCalledWith(order, 74.98, false)
  })

  it('does NOT call commandRepo.updatePaymentStatus when processRefund fails', async () => {
    vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder())
    vi.mocked(processRefund).mockRejectedValue(new OrderError('Stripe failed', 'STRIPE_ERROR'))
    await expect(useCase.execute('o1', 's1')).rejects.toMatchObject({ code: 'STRIPE_ERROR' })
    expect(commandRepo.updatePaymentStatus).not.toHaveBeenCalled()
  })
})
