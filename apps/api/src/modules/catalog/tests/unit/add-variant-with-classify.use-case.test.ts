import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AddVariantWithClassifyUseCase } from '../../application/use-cases/add-variant-with-classify.use-case'
import { CatalogError } from '../../domain/errors'
import type { CatalogProductQuery } from '../../application/queries/catalog-product.query'
import type { CatalogProductService } from '../../application/services/catalog-product.service'
import type { VariantClassifierService, ClassificationResult } from '../../application/services/variant-classifier.service'
import { makeProduct, makeVariant } from '../fixtures/catalog.fixtures'

function makeClassification(overrides: Partial<ClassificationResult> = {}): ClassificationResult {
  return { type: 'variant', confidence: 'high', ...overrides }
}

describe('AddVariantWithClassifyUseCase', () => {
  let catalogProductQuery: Pick<CatalogProductQuery, 'getById'>
  let catalogProductService: Pick<CatalogProductService, 'adminAddVariant'>
  let classifierService: Pick<VariantClassifierService, 'classify'>
  let useCase: AddVariantWithClassifyUseCase
  const variantData = { title: 'Red L', sku: 'SKU-1', suggestedPrice: 29.99 }

  beforeEach(() => {
    catalogProductQuery = {
      getById: vi.fn().mockResolvedValue(makeProduct()),
    }
    catalogProductService = {
      adminAddVariant: vi.fn().mockResolvedValue(makeVariant()),
    }
    classifierService = {
      classify: vi.fn().mockResolvedValue(makeClassification()),
    }
    useCase = new AddVariantWithClassifyUseCase(
      catalogProductQuery as CatalogProductQuery,
      catalogProductService as CatalogProductService,
      classifierService as VariantClassifierService,
    )
  })

  // ─── happy path ───────────────────────────────────────────────────────────────

  it('returns outcome=added when classification is variant/high', async () => {
    const result = await useCase.execute('p1', variantData)
    expect(result.outcome).toBe('added')
    if (result.outcome === 'added') {
      expect(result.classification).toBe('variant')
      expect(result.confidence).toBe('high')
      expect(result.lowConfidenceWarning).toBe(false)
    }
  })

  it('passes variant title and product title to classifier', async () => {
    await useCase.execute('p1', variantData)
    expect(classifierService.classify).toHaveBeenCalledWith('Red L', 'T-Shirt')
  })

  it('calls adminAddVariant with correct args', async () => {
    await useCase.execute('p1', variantData)
    expect(catalogProductService.adminAddVariant).toHaveBeenCalledWith('p1', variantData)
  })

  // ─── rejection ────────────────────────────────────────────────────────────────

  it('returns outcome=rejected when new_product + high confidence', async () => {
    vi.mocked(classifierService.classify).mockResolvedValue(
      makeClassification({ type: 'new_product', confidence: 'high', reason: 'Different category' })
    )
    const result = await useCase.execute('p1', variantData)
    expect(result.outcome).toBe('rejected')
    if (result.outcome === 'rejected') {
      expect(result.confidence).toBe('high')
      expect(result.reason).toBe('Different category')
    }
  })

  it('does NOT call adminAddVariant when rejected', async () => {
    vi.mocked(classifierService.classify).mockResolvedValue(
      makeClassification({ type: 'new_product', confidence: 'high' })
    )
    await useCase.execute('p1', variantData)
    expect(catalogProductService.adminAddVariant).not.toHaveBeenCalled()
  })

  it('proceeds (not rejected) when new_product + low confidence', async () => {
    vi.mocked(classifierService.classify).mockResolvedValue(
      makeClassification({ type: 'new_product', confidence: 'low' })
    )
    const result = await useCase.execute('p1', variantData)
    expect(result.outcome).toBe('added')
  })

  // ─── low confidence warning ───────────────────────────────────────────────────

  it('sets lowConfidenceWarning=true when confidence is low', async () => {
    vi.mocked(classifierService.classify).mockResolvedValue(
      makeClassification({ type: 'variant', confidence: 'low' })
    )
    const result = await useCase.execute('p1', variantData)
    if (result.outcome === 'added') {
      expect(result.lowConfidenceWarning).toBe(true)
    }
  })

  it('sets lowConfidenceWarning=false when confidence is high', async () => {
    const result = await useCase.execute('p1', variantData)
    if (result.outcome === 'added') {
      expect(result.lowConfidenceWarning).toBe(false)
    }
  })

  // ─── error propagation ────────────────────────────────────────────────────────

  it('propagates CatalogError from getById', async () => {
    vi.mocked(catalogProductQuery.getById).mockRejectedValue(new CatalogError('Not found', 'NOT_FOUND'))
    await expect(useCase.execute('x', variantData)).rejects.toThrow(CatalogError)
  })
})
