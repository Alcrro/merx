import type { ICatalogCategoryRepository } from '../../domain/ports'
import type { CatalogCategoryEntity } from '../../domain/entities'

export class CatalogCategoryQuery {
  constructor(private readonly categoryRepo: ICatalogCategoryRepository) {}

  listCategories(): Promise<CatalogCategoryEntity[]> {
    return this.categoryRepo.findCategories()
  }
}
