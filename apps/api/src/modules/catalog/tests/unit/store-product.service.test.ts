import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StoreProductService } from '../../application/services/store-product.service'
import { CatalogError } from '../../domain/errors'
import type { ICatalogProductRepository, IStoreProductRepository } from '../../domain/ports'
import { makeProduct, makeStoreProduct, makeStoreVariant } from '../fixtures/catalog.fixtures'

describe('StoreProductService', () => {
  let productRepo: ICatalogProductRepository
  let storeProductRepo: IStoreProductRepository
  let service: StoreProductService

  beforeEach(() => {
    productRepo = {
      findMany: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      isReferenced: vi.fn(),
    }
    storeProductRepo = {
      addToStore: vi.fn(),
      getStoreProducts: vi.fn(),
      findStoreProduct: vi.fn(),
      findStoreProductById: vi.fn(),
      updateStoreProduct: vi.fn(),
      addStoreVariant: vi.fn(),
      removeStoreVariant: vi.fn(),
      updateStoreVariantPrice: vi.fn(),
    }
    service = new StoreProductService(productRepo, storeProductRepo)
  })

  // ─── addToStore ───────────────────────────────────────────────────────────────

  describe('addToStore', () => {
    it('throws NOT_FOUND when product does not exist', async () => {
      vi.mocked(productRepo.findById).mockResolvedValue(null)
      await expect(service.addToStore('s1', 'p1', [])).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('throws INVALID when product is not active', async () => {
      vi.mocked(productRepo.findById).mockResolvedValue(makeProduct({ status: 'pending' }))
      await expect(service.addToStore('s1', 'p1', [])).rejects.toMatchObject({ code: 'INVALID' })
    })

    it('delegates to repo with correct args when product is active', async () => {
      vi.mocked(productRepo.findById).mockResolvedValue(makeProduct())
      vi.mocked(storeProductRepo.addToStore).mockResolvedValue(makeStoreProduct())
      await service.addToStore('s1', 'p1', ['v1', 'v2'])
      expect(storeProductRepo.addToStore).toHaveBeenCalledWith('s1', 'p1', ['v1', 'v2'])
    })
  })

  // ─── getStoreProduct ──────────────────────────────────────────────────────────

  describe('getStoreProduct', () => {
    it('throws NOT_FOUND when store product missing', async () => {
      vi.mocked(storeProductRepo.findStoreProductById).mockResolvedValue(null)
      await expect(service.getStoreProduct('sp1', 's1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('returns store product when found', async () => {
      const sp = makeStoreProduct()
      vi.mocked(storeProductRepo.findStoreProductById).mockResolvedValue(sp)
      await expect(service.getStoreProduct('sp1', 's1')).resolves.toEqual(sp)
    })
  })

  // ─── updateStoreProduct ───────────────────────────────────────────────────────

  describe('updateStoreProduct', () => {
    it('throws NOT_FOUND when store product missing', async () => {
      vi.mocked(storeProductRepo.findStoreProductById).mockResolvedValue(null)
      await expect(service.updateStoreProduct('sp1', 's1', { shippingCost: 5 })).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('delegates update when store product exists', async () => {
      vi.mocked(storeProductRepo.findStoreProductById).mockResolvedValue(makeStoreProduct())
      vi.mocked(storeProductRepo.updateStoreProduct).mockResolvedValue(makeStoreProduct({ shippingCost: 5 }))
      await service.updateStoreProduct('sp1', 's1', { shippingCost: 5 })
      expect(storeProductRepo.updateStoreProduct).toHaveBeenCalledWith('sp1', { shippingCost: 5 })
    })
  })

  // ─── updateVariantPrice ───────────────────────────────────────────────────────

  describe('updateVariantPrice', () => {
    it('throws NOT_FOUND when store product missing', async () => {
      vi.mocked(storeProductRepo.findStoreProductById).mockResolvedValue(null)
      await expect(service.updateVariantPrice('sp1', 's1', 'v1', 10)).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('throws INVALID for negative price', async () => {
      vi.mocked(storeProductRepo.findStoreProductById).mockResolvedValue(makeStoreProduct())
      await expect(service.updateVariantPrice('sp1', 's1', 'v1', -1)).rejects.toMatchObject({ code: 'INVALID' })
    })

    it('allows null price to reset to suggested', async () => {
      vi.mocked(storeProductRepo.findStoreProductById).mockResolvedValue(makeStoreProduct())
      vi.mocked(storeProductRepo.updateStoreVariantPrice).mockResolvedValue(makeStoreVariant())
      await service.updateVariantPrice('sp1', 's1', 'v1', null)
      expect(storeProductRepo.updateStoreVariantPrice).toHaveBeenCalledWith('sp1', 'v1', null)
    })

    it('allows zero price', async () => {
      vi.mocked(storeProductRepo.findStoreProductById).mockResolvedValue(makeStoreProduct())
      vi.mocked(storeProductRepo.updateStoreVariantPrice).mockResolvedValue(makeStoreVariant({ customPrice: 0 }))
      await expect(service.updateVariantPrice('sp1', 's1', 'v1', 0)).resolves.toBeDefined()
    })
  })

  // ─── addVariantToStore ────────────────────────────────────────────────────────

  describe('addVariantToStore', () => {
    it('throws NOT_FOUND when store product missing', async () => {
      vi.mocked(storeProductRepo.findStoreProductById).mockResolvedValue(null)
      await expect(service.addVariantToStore('sp1', 'v1', 's1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('delegates to addStoreVariant when found', async () => {
      vi.mocked(storeProductRepo.findStoreProductById).mockResolvedValue(makeStoreProduct())
      vi.mocked(storeProductRepo.addStoreVariant).mockResolvedValue(makeStoreVariant())
      await service.addVariantToStore('sp1', 'v1', 's1')
      expect(storeProductRepo.addStoreVariant).toHaveBeenCalledWith('sp1', 'v1')
    })
  })

  // ─── removeVariantFromStore ───────────────────────────────────────────────────

  describe('removeVariantFromStore', () => {
    it('throws NOT_FOUND when store product missing', async () => {
      vi.mocked(storeProductRepo.findStoreProductById).mockResolvedValue(null)
      await expect(service.removeVariantFromStore('sp1', 'v1', 's1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('delegates to removeStoreVariant when found', async () => {
      vi.mocked(storeProductRepo.findStoreProductById).mockResolvedValue(makeStoreProduct())
      vi.mocked(storeProductRepo.removeStoreVariant).mockResolvedValue(undefined)
      await service.removeVariantFromStore('sp1', 'v1', 's1')
      expect(storeProductRepo.removeStoreVariant).toHaveBeenCalledWith('sp1', 'v1')
    })
  })
})
