import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderService } from '../../application/services/order.service'
import type { IOrderQueryRepository } from '../../application/ports'
import type { IOrderCommandRepository } from '../../domain/ports/order-command.repository.port'
import { makeOrder, makeQueryRepo, makeCommandRepo } from '../fixtures/order.fixtures'

describe('OrderService', () => {
  let queryRepo: IOrderQueryRepository
  let commandRepo: IOrderCommandRepository
  let service: OrderService

  beforeEach(() => {
    queryRepo = makeQueryRepo()
    commandRepo = makeCommandRepo()
    service = new OrderService(queryRepo, commandRepo)
  })

  // ─── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    const validData = {
      currency: 'RON',
      items: [{ title: 'Produs', quantity: 1, unitPrice: 50 }],
    }

    it('throws INVALID when items list is empty', async () => {
      await expect(service.create('s1', { currency: 'RON', items: [] }))
        .rejects.toMatchObject({ code: 'INVALID' })
    })

    it('throws INVALID for item with zero quantity', async () => {
      await expect(service.create('s1', { currency: 'RON', items: [{ title: 'X', quantity: 0, unitPrice: 10 }] }))
        .rejects.toMatchObject({ code: 'INVALID' })
    })

    it('throws INVALID for item with negative price (Money.validate)', async () => {
      await expect(service.create('s1', { currency: 'RON', items: [{ title: 'X', quantity: 1, unitPrice: -1 }] }))
        .rejects.toMatchObject({ code: 'INVALID' })
    })

    it('allows zero price', async () => {
      vi.mocked(commandRepo.create).mockResolvedValue(makeOrder())
      await expect(service.create('s1', { currency: 'RON', items: [{ title: 'X', quantity: 1, unitPrice: 0 }] }))
        .resolves.toBeDefined()
    })

    it('delegates to commandRepo.create when valid', async () => {
      vi.mocked(commandRepo.create).mockResolvedValue(makeOrder())
      await service.create('s1', validData)
      expect(commandRepo.create).toHaveBeenCalledWith('s1', validData)
    })
  })

  // ─── updateStatus ─────────────────────────────────────────────────────────────

  describe('updateStatus', () => {
    it('throws NOT_FOUND when order missing', async () => {
      vi.mocked(queryRepo.findById).mockResolvedValue(null)
      await expect(service.updateStatus('o1', 's1', 'ACTIVE')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('throws CONFLICT when order is CANCELLED (entity guard)', async () => {
      vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder({ status: 'CANCELLED' }))
      await expect(service.updateStatus('o1', 's1', 'ACTIVE')).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('throws CONFLICT when reverting a COMPLETED order (entity guard)', async () => {
      vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder({ status: 'COMPLETED' }))
      await expect(service.updateStatus('o1', 's1', 'ACTIVE')).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('allows ACTIVE → COMPLETED transition', async () => {
      vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder({ status: 'ACTIVE' }))
      vi.mocked(commandRepo.updateStatus).mockResolvedValue(makeOrder({ status: 'COMPLETED' }))
      await expect(service.updateStatus('o1', 's1', 'COMPLETED')).resolves.toBeDefined()
    })

    it('reads from queryRepo and writes to commandRepo', async () => {
      vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder())
      vi.mocked(commandRepo.updateStatus).mockResolvedValue(makeOrder({ status: 'COMPLETED' }))
      await service.updateStatus('o1', 's1', 'COMPLETED')
      expect(queryRepo.findById).toHaveBeenCalledWith('o1', 's1')
      expect(commandRepo.updateStatus).toHaveBeenCalledWith('o1', 's1', 'COMPLETED')
    })
  })

  // ─── updatePaymentStatus ──────────────────────────────────────────────────────

  describe('updatePaymentStatus', () => {
    it('throws NOT_FOUND when order missing', async () => {
      vi.mocked(queryRepo.findById).mockResolvedValue(null)
      await expect(service.updatePaymentStatus('o1', 's1', 'PAID')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('throws CONFLICT when status combination is invalid (entity guard)', async () => {
      vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder({ status: 'CANCELLED' }))
      await expect(service.updatePaymentStatus('o1', 's1', 'PAID')).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('reads from queryRepo and writes to commandRepo', async () => {
      vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder())
      vi.mocked(commandRepo.updatePaymentStatus).mockResolvedValue(makeOrder({ paymentStatus: 'PAID' }))
      await service.updatePaymentStatus('o1', 's1', 'PAID')
      expect(commandRepo.updatePaymentStatus).toHaveBeenCalledWith('o1', 's1', 'PAID')
    })
  })

  // ─── updateFulfillmentStatus ──────────────────────────────────────────────────

  describe('updateFulfillmentStatus', () => {
    it('throws NOT_FOUND when order missing', async () => {
      vi.mocked(queryRepo.findById).mockResolvedValue(null)
      await expect(service.updateFulfillmentStatus('o1', 's1', 'PROCESSING')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('throws CONFLICT on invalid transition (entity guard)', async () => {
      vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder({ fulfillmentStatus: 'FULFILLED' }))
      await expect(service.updateFulfillmentStatus('o1', 's1', 'PROCESSING')).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('reads from queryRepo and writes to commandRepo', async () => {
      vi.mocked(queryRepo.findById).mockResolvedValue(makeOrder())
      vi.mocked(commandRepo.updateFulfillmentStatus).mockResolvedValue(makeOrder({ fulfillmentStatus: 'PROCESSING' }))
      await service.updateFulfillmentStatus('o1', 's1', 'PROCESSING')
      expect(commandRepo.updateFulfillmentStatus).toHaveBeenCalledWith('o1', 's1', 'PROCESSING')
    })
  })
})
