import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CatalogProductService } from '../../application/services/catalog-product.service'
import { CatalogError } from '../../domain/errors'
import type {
  ICatalogProductRepository,
  ICatalogVariantRepository,
} from '../../domain/ports'
import { makeProduct } from '../fixtures/catalog.fixtures'

describe('CatalogProductService', () => {
  let productRepo: ICatalogProductRepository
  let variantRepo: ICatalogVariantRepository
  let service: CatalogProductService

  beforeEach(() => {
    productRepo = {
      findMany: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      isReferenced: vi.fn(),
    }
    variantRepo = {
      createVariant: vi.fn(),
      findVariant: vi.fn(),
    }
    service = new CatalogProductService(productRepo, variantRepo)
  })

  // ─── adminUpdate ─────────────────────────────────────────────────────────────

  describe('adminUpdate', () => {
    it('throws NOT_FOUND when product missing', async () => {
      vi.mocked(productRepo.findById).mockResolvedValue(null)
      await expect(service.adminUpdate('p1', { title: 'X' })).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('throws INVALID when product is archived', async () => {
      vi.mocked(productRepo.findById).mockResolvedValue(makeProduct({ status: 'archived' }))
      await expect(service.adminUpdate('p1', { title: 'X' })).rejects.toMatchObject({ code: 'INVALID' })
    })

    it('calls repo.update when product is active', async () => {
      const product = makeProduct()
      vi.mocked(productRepo.findById).mockResolvedValue(product)
      vi.mocked(productRepo.update).mockResolvedValue(makeProduct({ title: 'Updated' }))
      await service.adminUpdate('p1', { title: 'Updated' })
      expect(productRepo.update).toHaveBeenCalledWith('p1', { title: 'Updated' })
    })
  })

  // ─── adminArchive ─────────────────────────────────────────────────────────────

  describe('adminArchive', () => {
    it('throws NOT_FOUND when product missing', async () => {
      vi.mocked(productRepo.findById).mockResolvedValue(null)
      await expect(service.adminArchive('p1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('throws CONFLICT when already archived', async () => {
      vi.mocked(productRepo.findById).mockResolvedValue(makeProduct({ status: 'archived' }))
      await expect(service.adminArchive('p1')).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('calls repo.archive for active product', async () => {
      const product = makeProduct()
      vi.mocked(productRepo.findById).mockResolvedValue(product)
      vi.mocked(productRepo.archive).mockResolvedValue(makeProduct({ status: 'archived' }))
      await service.adminArchive('p1')
      expect(productRepo.archive).toHaveBeenCalledWith('p1')
    })
  })

  // ─── adminAddVariant ──────────────────────────────────────────────────────────

  describe('adminAddVariant', () => {
    it('throws NOT_FOUND when product missing', async () => {
      vi.mocked(productRepo.findById).mockResolvedValue(null)
      await expect(service.adminAddVariant('p1', { title: 'Red', sku: 'S1', suggestedPrice: 10 }))
        .rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('throws INVALID when product not active', async () => {
      vi.mocked(productRepo.findById).mockResolvedValue(makeProduct({ status: 'pending' }))
      await expect(service.adminAddVariant('p1', { title: 'Red', sku: 'S1', suggestedPrice: 10 }))
        .rejects.toMatchObject({ code: 'INVALID' })
    })

    it('throws INVALID for negative suggestedPrice', async () => {
      vi.mocked(productRepo.findById).mockResolvedValue(makeProduct())
      await expect(service.adminAddVariant('p1', { title: 'Red', sku: 'S1', suggestedPrice: -1 }))
        .rejects.toMatchObject({ code: 'INVALID' })
    })

    it('delegates to variantRepo when valid', async () => {
      vi.mocked(productRepo.findById).mockResolvedValue(makeProduct())
      vi.mocked(variantRepo.createVariant).mockResolvedValue({
        id: 'v1', catalogProductId: 'p1', title: 'Red', sku: 'S1', suggestedPrice: 10, createdAt: new Date(),
      })
      await service.adminAddVariant('p1', { title: 'Red', sku: 'S1', suggestedPrice: 10 })
      expect(variantRepo.createVariant).toHaveBeenCalledWith('p1', { title: 'Red', sku: 'S1', suggestedPrice: 10 })
    })
  })
})
