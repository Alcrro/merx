import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderQuery } from '../../application/queries/order.query'
import { OrderError } from '../../domain/errors'
import type { IOrderQueryRepository } from '../../application/ports'
import { makeOrder, makeQueryRepo } from '../fixtures/order.fixtures'

describe('OrderQuery', () => {
  let queryRepo: IOrderQueryRepository
  let query: OrderQuery

  beforeEach(() => {
    queryRepo = makeQueryRepo()
    query = new OrderQuery(queryRepo)
  })

  // ─── list ─────────────────────────────────────────────────────────────────────

  describe('list', () => {
    it('delegates to queryRepo.list', async () => {
      const result = { data: [], total: 0, page: 1, limit: 20 }
      vi.mocked(queryRepo.list).mockResolvedValue(result)
      await expect(query.list({ storeId: 's1', page: 1, limit: 20 })).resolves.toEqual(result)
      expect(queryRepo.list).toHaveBeenCalledWith({ storeId: 's1', page: 1, limit: 20 })
    })
  })

  // ─── get ──────────────────────────────────────────────────────────────────────

  describe('get', () => {
    it('returns order when found', async () => {
      const order = makeOrder()
      vi.mocked(queryRepo.findById).mockResolvedValue(order)
      await expect(query.get('o1', 's1')).resolves.toEqual(order)
    })

    it('throws NOT_FOUND when order missing', async () => {
      vi.mocked(queryRepo.findById).mockResolvedValue(null)
      await expect(query.get('x', 's1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
      await expect(query.get('x', 's1')).rejects.toThrow(OrderError)
    })
  })

  // ─── getBySlug ────────────────────────────────────────────────────────────────

  describe('getBySlug', () => {
    it('throws NOT_FOUND for invalid slug format', async () => {
      await expect(query.getBySlug('INVALID', 's1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('throws NOT_FOUND when order does not exist', async () => {
      vi.mocked(queryRepo.findByOrderNumber).mockResolvedValue(null)
      await expect(query.getBySlug('ORD-1001-20260101', 's1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('parses order number from slug and delegates to repo', async () => {
      const order = makeOrder()
      vi.mocked(queryRepo.findByOrderNumber).mockResolvedValue(order)
      await expect(query.getBySlug('ORD-1001-20260101', 's1')).resolves.toEqual(order)
      expect(queryRepo.findByOrderNumber).toHaveBeenCalledWith(1001, 's1')
    })
  })
})
