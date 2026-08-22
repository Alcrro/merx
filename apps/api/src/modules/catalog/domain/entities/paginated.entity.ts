import type { CatalogProduct } from './catalog-product.entity'

export interface PaginatedCatalogProducts {
  data: CatalogProduct[]
  total: number
  page: number
  limit: number
}
