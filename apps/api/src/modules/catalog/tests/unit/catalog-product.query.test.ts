import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CatalogProductQuery } from '../../application/queries/catalog-product.query'
import { CatalogError } from '../../domain/errors'
import type { ICatalogProductRepository } from '../../domain/ports'
import { makeProduct } from '../fixtures/catalog.fixtures'

describe('CatalogProductQuery', () => {
  let productRepo: ICatalogProductRepository
  let query: CatalogProductQuery

  beforeEach(() => {
    productRepo = {
      findMany: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      isReferenced: vi.fn(),
    }
    query = new CatalogProductQuery(productRepo)
  })

  // ─── search ───────────────────────────────────────────────────────────────────

  describe('search', () => {
    it('calls findMany with status=active', async () => {
      vi.mocked(productRepo.findMany).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 })
      await query.search({ page: 1, limit: 20 })
      expect(productRepo.findMany).toHaveBeenCalledWith(expect.objectContaining({ status: 'active' }))
    })
  })

  // ─── adminSearch ──────────────────────────────────────────────────────────────

  describe('adminSearch', () => {
    it('calls findMany without forcing active status', async () => {
      vi.mocked(productRepo.findMany).mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 })
      await query.adminSearch({ page: 1, limit: 20, status: 'archived' })
      expect(productRepo.findMany).toHaveBeenCalledWith(expect.objectContaining({ status: 'archived' }))
    })
  })

  // ─── getById ─────────────────────────────────────────────────────────────────

  describe('getById', () => {
    it('returns product when found', async () => {
      const product = makeProduct()
      vi.mocked(productRepo.findById).mockResolvedValue(product)
      await expect(query.getById('p1')).resolves.toEqual(product)
    })

    it('throws CatalogError NOT_FOUND when missing', async () => {
      vi.mocked(productRepo.findById).mockResolvedValue(null)
      await expect(query.getById('x')).rejects.toThrow(CatalogError)
      await expect(query.getById('x')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })
  })
})
