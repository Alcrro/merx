import { describe, it, expect, vi } from 'vitest'
import type { Response } from 'express'
import { handleCatalogError } from '../../presentation/errors/catalog.errors'
import { CatalogError, CatalogVariantImageError, ArchiveCriteriaError } from '../../domain/errors'

function makeRes() {
  const json = vi.fn()
  const status = vi.fn().mockReturnValue({ json })
  return { res: { status, json } as unknown as Response, status, json }
}

describe('handleCatalogError', () => {
  describe('CatalogError', () => {
    it('returns 404 for NOT_FOUND', () => {
      const { res, status } = makeRes()
      const handled = handleCatalogError(new CatalogError('Not found', 'NOT_FOUND'), res)
      expect(handled).toBe(true)
      expect(status).toHaveBeenCalledWith(404)
    })

    it('returns 409 for CONFLICT', () => {
      const { res, status } = makeRes()
      handleCatalogError(new CatalogError('Conflict', 'CONFLICT'), res)
      expect(status).toHaveBeenCalledWith(409)
    })

    it('returns 400 for INVALID', () => {
      const { res, status } = makeRes()
      handleCatalogError(new CatalogError('Invalid', 'INVALID'), res)
      expect(status).toHaveBeenCalledWith(400)
    })

    it('returns 400 for FORBIDDEN', () => {
      const { res, status } = makeRes()
      handleCatalogError(new CatalogError('Forbidden', 'FORBIDDEN'), res)
      expect(status).toHaveBeenCalledWith(400)
    })

    it('includes error message in json body', () => {
      const { res, status, json } = makeRes()
      handleCatalogError(new CatalogError('Product not found', 'NOT_FOUND'), res)
      expect(status().json).toHaveBeenCalledWith({ error: 'Product not found' })
    })
  })

  describe('ArchiveCriteriaError', () => {
    it('returns 404 for NOT_FOUND', () => {
      const { res, status } = makeRes()
      handleCatalogError(new ArchiveCriteriaError('Not found', 'NOT_FOUND'), res)
      expect(status).toHaveBeenCalledWith(404)
    })

    it('returns 409 for CONFLICT', () => {
      const { res, status } = makeRes()
      handleCatalogError(new ArchiveCriteriaError('Conflict', 'CONFLICT'), res)
      expect(status).toHaveBeenCalledWith(409)
    })
  })

  describe('CatalogVariantImageError', () => {
    it('returns 404 for NOT_FOUND', () => {
      const { res, status } = makeRes()
      handleCatalogError(new CatalogVariantImageError('Not found', 'NOT_FOUND'), res)
      expect(status).toHaveBeenCalledWith(404)
    })

    it('returns 400 for LIMIT_EXCEEDED', () => {
      const { res, status } = makeRes()
      handleCatalogError(new CatalogVariantImageError('Limit', 'LIMIT_EXCEEDED'), res)
      expect(status).toHaveBeenCalledWith(400)
    })
  })

  describe('unknown errors', () => {
    it('returns false for non-catalog errors', () => {
      const { res } = makeRes()
      expect(handleCatalogError(new Error('random'), res)).toBe(false)
    })

    it('returns false for non-Error values', () => {
      const { res } = makeRes()
      expect(handleCatalogError('string error', res)).toBe(false)
      expect(handleCatalogError(null, res)).toBe(false)
    })
  })
})
