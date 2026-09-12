import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CancelOrderUseCase } from '../../application/use-cases/cancel-order.use-case'
import type { NotifyCancelFn } from '../../application/use-cases/cancel-order.use-case'
import type { IOrderQueryRepository } from '../../application/ports'
import type { IOrderCommandRepository } from '../../domain/ports/order-command.repository.port'
import { makeOrder, makeQueryRepo, makeCommandRepo } from '../fixtures/order.fixtures'

describe('CancelOrderUseCase', () => {
  let queryRepo: IOrderQueryRepository
  let commandRepo: IOrderCommandRepository
  let notifyCancel: NotifyCancelFn
  let useCase: CancelOrderUseCase

  beforeEach(() => {
    queryRepo = makeQueryRepo()
    commandRepo = makeCommandRepo()
    notifyCancel = vi.fn<NotifyCancelFn>().mockResolvedValue(undefined)
    useCase = new CancelOrderUseCase(queryRepo, commandRepo, notifyCancel)
  })

  it('throws NOT_FOUND when order missing', async () => {
    vi.mocked(queryRepo.findById).mockResolvedValue(null)
    await expect(useCase.execute('o1', 's1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('throws CONFLICT when already CANCELLED', async () => {
    vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder({ status: 'CANCELLED' }))
    await expect(useCase.execute('o1', 's1')).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('throws CONFLICT when order is COMPLETED', async () => {
    vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder({ status: 'COMPLETED' }))
    await expect(useCase.execute('o1', 's1')).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('calls commandRepo.updateStatus with CANCELLED', async () => {
    vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder())
    vi.mocked(commandRepo.updateStatus).mockResolvedValue(makeOrder({ status: 'CANCELLED' }))
    await useCase.execute('o1', 's1')
    expect(commandRepo.updateStatus).toHaveBeenCalledWith('o1', 's1', 'CANCELLED')
  })

  it('fires notifyCancel with the original order', async () => {
    const order = makeOrder()
    vi.mocked(queryRepo.findById).mockResolvedValue(order)
    vi.mocked(commandRepo.updateStatus).mockResolvedValue(makeOrder({ status: 'CANCELLED' }))
    await useCase.execute('o1', 's1')
    expect(notifyCancel).toHaveBeenCalledWith(order)
  })

  it('returns the cancelled order from commandRepo', async () => {
    const cancelled = makeOrder({ status: 'CANCELLED' })
    vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder())
    vi.mocked(commandRepo.updateStatus).mockResolvedValue(cancelled)
    const result = await useCase.execute('o1', 's1')
    expect(result).toBe(cancelled)
  })
})
