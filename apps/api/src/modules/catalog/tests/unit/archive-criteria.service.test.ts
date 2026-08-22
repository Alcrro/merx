import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ArchiveCriteriaService, ArchiveCriteriaError } from '../../application/services/archive-criteria.service'
import type { IArchiveCriteriaRepository } from '../../domain/ports'
import { makeCriteria } from '../fixtures/catalog.fixtures'

describe('ArchiveCriteriaService', () => {
  let repo: IArchiveCriteriaRepository
  let service: ArchiveCriteriaService

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
    service = new ArchiveCriteriaService(repo)
  })

  // ─── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('throws CONFLICT when criteriaKey already exists', async () => {
      vi.mocked(repo.findByKey).mockResolvedValue(makeCriteria())
      await expect(service.create({ name: 'X', criteriaKey: 'never_added_to_store', value: '3' }))
        .rejects.toThrow(ArchiveCriteriaError)
      await expect(service.create({ name: 'X', criteriaKey: 'never_added_to_store', value: '3' }))
        .rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('delegates to repo.create when key is unique', async () => {
      vi.mocked(repo.findByKey).mockResolvedValue(null)
      vi.mocked(repo.create).mockResolvedValue(makeCriteria())
      await service.create({ name: 'New', criteriaKey: 'new_key', value: '5' })
      expect(repo.create).toHaveBeenCalledWith({ name: 'New', criteriaKey: 'new_key', value: '5' })
    })
  })

  // ─── update ───────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('throws NOT_FOUND when criteria missing', async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)
      await expect(service.update('x', { value: '5' })).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('delegates to repo.update when found', async () => {
      vi.mocked(repo.findById).mockResolvedValue(makeCriteria())
      vi.mocked(repo.update).mockResolvedValue(makeCriteria({ value: '5' }))
      await service.update('c1', { value: '5' })
      expect(repo.update).toHaveBeenCalledWith('c1', { value: '5' })
    })
  })

  // ─── delete ───────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('throws NOT_FOUND when criteria missing', async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)
      await expect(service.delete('x')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('calls repo.delete when found', async () => {
      vi.mocked(repo.findById).mockResolvedValue(makeCriteria())
      vi.mocked(repo.delete).mockResolvedValue(undefined)
      await service.delete('c1')
      expect(repo.delete).toHaveBeenCalledWith('c1')
    })
  })
})
