import type { IArchiveCriteriaRepository, CreateArchiveCriteriaData, UpdateArchiveCriteriaData } from '../../domain/ports'
import type { ArchiveCriteriaEntity } from '../../domain/entities'
import { ArchiveCriteriaError } from '../../domain/errors'

export { ArchiveCriteriaError }
export type { ArchiveCriteriaEntity, CreateArchiveCriteriaData, UpdateArchiveCriteriaData }

export class ArchiveCriteriaService {
  constructor(private readonly repo: IArchiveCriteriaRepository) {}

  list(): Promise<ArchiveCriteriaEntity[]> {
    return this.repo.findAll()
  }

  async create(data: CreateArchiveCriteriaData): Promise<ArchiveCriteriaEntity> {
    const existing = await this.repo.findByKey(data.criteriaKey)
    if (existing) throw new ArchiveCriteriaError(`Criteria key '${data.criteriaKey}' already exists`, 'CONFLICT')
    return this.repo.create(data)
  }

  async update(id: string, data: UpdateArchiveCriteriaData): Promise<ArchiveCriteriaEntity> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new ArchiveCriteriaError('Archive criteria not found', 'NOT_FOUND')
    return this.repo.update(id, data)
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repo.findById(id)
    if (!existing) throw new ArchiveCriteriaError('Archive criteria not found', 'NOT_FOUND')
    await this.repo.delete(id)
  }

}
