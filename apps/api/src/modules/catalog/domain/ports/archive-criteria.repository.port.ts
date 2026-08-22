import type { ArchiveCriteriaEntity } from '../entities'
import type { ProductForArchiveEvaluation } from '../types'

export interface CreateArchiveCriteriaData {
  name: string
  criteriaKey: string
  value: string
  enabled?: boolean
}

export interface UpdateArchiveCriteriaData {
  name?: string
  value?: string
  enabled?: boolean
}

export interface IArchiveCriteriaRepository {
  findAll(): Promise<ArchiveCriteriaEntity[]>
  findEnabled(): Promise<ArchiveCriteriaEntity[]>
  findByKey(criteriaKey: string): Promise<ArchiveCriteriaEntity | null>
  findById(id: string): Promise<ArchiveCriteriaEntity | null>
  create(data: CreateArchiveCriteriaData): Promise<ArchiveCriteriaEntity>
  update(id: string, data: UpdateArchiveCriteriaData): Promise<ArchiveCriteriaEntity>
  delete(id: string): Promise<void>
  findActiveProductsForEvaluation(): Promise<ProductForArchiveEvaluation[]>
  archiveMany(ids: string[]): Promise<void>
}
