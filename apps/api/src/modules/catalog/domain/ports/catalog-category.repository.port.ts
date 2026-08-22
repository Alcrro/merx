import type { CatalogCategoryEntity } from '../entities'

export interface ICatalogCategoryRepository {
  findCategories(): Promise<CatalogCategoryEntity[]>
  findCategoryById(id: string): Promise<CatalogCategoryEntity | null>
}
