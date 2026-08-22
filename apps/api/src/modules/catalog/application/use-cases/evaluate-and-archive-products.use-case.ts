import type { IArchiveCriteriaRepository } from '../../domain/ports'

export class EvaluateAndArchiveProductsUseCase {
  constructor(private readonly repo: IArchiveCriteriaRepository) {}

  async execute(): Promise<{ archived: number }> {
    const criteria = await this.repo.findEnabled()
    if (criteria.length === 0) return { archived: 0 }

    const products = await this.repo.findActiveProductsForEvaluation()
    const toArchiveIds = new Set<string>()

    for (const product of products) {
      for (const criterion of criteria) {
        if (criterion.shouldArchive(product)) {
          toArchiveIds.add(product.id)
          break
        }
      }
    }

    if (toArchiveIds.size === 0) return { archived: 0 }

    await this.repo.archiveMany([...toArchiveIds])
    return { archived: toArchiveIds.size }
  }
}
