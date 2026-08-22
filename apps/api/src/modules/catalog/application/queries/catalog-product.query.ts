import type { ICatalogProductRepository } from '../../domain/ports'
import type { CatalogProductEntity, PaginatedCatalogProducts } from '../../domain/entities'
import type { SearchCatalogParams } from '../../domain/types'
import { CatalogError } from '../../domain/errors'

export class CatalogProductQuery {
  constructor(private readonly productRepo: ICatalogProductRepository) {}

  search(params: SearchCatalogParams): Promise<PaginatedCatalogProducts> {
    return this.productRepo.findMany({ ...params, status: 'active' })
  }

  adminSearch(params: SearchCatalogParams): Promise<PaginatedCatalogProducts> {
    return this.productRepo.findMany(params)
  }

  async getById(id: string): Promise<CatalogProductEntity> {
    const product = await this.productRepo.findById(id)
    if (!product) throw new CatalogError('Catalog product not found', 'NOT_FOUND')
    return product
  }
}
