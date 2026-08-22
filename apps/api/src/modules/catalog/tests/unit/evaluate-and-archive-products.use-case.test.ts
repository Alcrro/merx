import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EvaluateAndArchiveProductsUseCase } from '../../application/use-cases/evaluate-and-archive-products.use-case'
import type { IArchiveCriteriaRepository } from '../../domain/ports'
import { makeCriteria, makeProductForEvaluation as makeProduct } from '../fixtures/catalog.fixtures'

describe('EvaluateAndArchiveProductsUseCase', () => {
  let repo: IArchiveCriteriaRepository
  let useCase: EvaluateAndArchiveProductsUseCase

  beforeEach(() => {
    repo = {
      findAll: vi.fn(),
      findEnabled: vi.fn(),
      findByKey: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findActiveProductsForEvaluation: vi.fn(),
      archiveMany: vi.fn(),
    }
    useCase = new EvaluateAndArchiveProductsUseCase(repo)
  })

  it('returns { archived: 0 } when no enabled criteria', async () => {
    vi.mocked(repo.findEnabled).mockResolvedValue([])
    await expect(useCase.execute()).resolves.toEqual({ archived: 0 })
    expect(repo.findActiveProductsForEvaluation).not.toHaveBeenCalled()
  })

  it('returns { archived: 0 } when no products match', async () => {
    vi.mocked(repo.findEnabled).mockResolvedValue([makeCriteria()])
    vi.mocked(repo.findActiveProductsForEvaluation).mockResolvedValue([
      makeProduct({ storeProductCount: 1 }),
    ])
    await expect(useCase.execute()).resolves.toEqual({ archived: 0 })
    expect(repo.archiveMany).not.toHaveBeenCalled()
  })

  it('archives product with no variants (no_active_variants)', async () => {
    vi.mocked(repo.findEnabled).mockResolvedValue([
      makeCriteria({ criteriaKey: 'no_active_variants', value: '0' }),
    ])
    vi.mocked(repo.findActiveProductsForEvaluation).mockResolvedValue([
      makeProduct({ variantCount: 0 }),
    ])
    vi.mocked(repo.archiveMany).mockResolvedValue(undefined)
    const result = await useCase.execute()
    expect(result).toEqual({ archived: 1 })
    expect(repo.archiveMany).toHaveBeenCalledWith(['p1'])
  })

  it('archives product with enough rejected requests', async () => {
    vi.mocked(repo.findEnabled).mockResolvedValue([
      makeCriteria({ criteriaKey: 'rejected_requests', value: '3' }),
    ])
    vi.mocked(repo.findActiveProductsForEvaluation).mockResolvedValue([
      makeProduct({ rejectedRequestCount: 3 }),
    ])
    vi.mocked(repo.archiveMany).mockResolvedValue(undefined)
    const result = await useCase.execute()
    expect(result).toEqual({ archived: 1 })
  })

  it('does not archive product with fewer rejected requests than threshold', async () => {
    vi.mocked(repo.findEnabled).mockResolvedValue([
      makeCriteria({ criteriaKey: 'rejected_requests', value: '3' }),
    ])
    vi.mocked(repo.findActiveProductsForEvaluation).mockResolvedValue([
      makeProduct({ rejectedRequestCount: 2 }),
    ])
    const result = await useCase.execute()
    expect(result).toEqual({ archived: 0 })
  })

  it('deduplicates — product matching multiple criteria is archived once', async () => {
    vi.mocked(repo.findEnabled).mockResolvedValue([
      makeCriteria({ id: 'c1', criteriaKey: 'no_active_variants', value: '0' }),
      makeCriteria({ id: 'c2', criteriaKey: 'rejected_requests', value: '1' }),
    ])
    vi.mocked(repo.findActiveProductsForEvaluation).mockResolvedValue([
      makeProduct({ variantCount: 0, rejectedRequestCount: 2 }),
    ])
    vi.mocked(repo.archiveMany).mockResolvedValue(undefined)
    const result = await useCase.execute()
    expect(result).toEqual({ archived: 1 })
    expect(repo.archiveMany).toHaveBeenCalledWith(['p1'])
  })

  it('archives product older than threshold with no store products (never_added_to_store)', async () => {
    const oldDate = new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000)
    vi.mocked(repo.findEnabled).mockResolvedValue([
      makeCriteria({ criteriaKey: 'never_added_to_store', value: '3' }),
    ])
    vi.mocked(repo.findActiveProductsForEvaluation).mockResolvedValue([
      makeProduct({ createdAt: oldDate, storeProductCount: 0 }),
    ])
    vi.mocked(repo.archiveMany).mockResolvedValue(undefined)
    const result = await useCase.execute()
    expect(result).toEqual({ archived: 1 })
  })

  it('does NOT archive product younger than threshold (never_added_to_store)', async () => {
    const recentDate = new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000)
    vi.mocked(repo.findEnabled).mockResolvedValue([
      makeCriteria({ criteriaKey: 'never_added_to_store', value: '3' }),
    ])
    vi.mocked(repo.findActiveProductsForEvaluation).mockResolvedValue([
      makeProduct({ createdAt: recentDate, storeProductCount: 0 }),
    ])
    const result = await useCase.execute()
    expect(result).toEqual({ archived: 0 })
  })
})
