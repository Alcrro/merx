import type { CatalogVariantImageEntity } from '../entities'

export interface CreateCatalogVariantImageData {
  catalogVariantId: string
  url: string
  altText?: string | null
  position: number
  isPrimary: boolean
}

export interface ICatalogVariantImageRepository {
  findByVariantId(variantId: string): Promise<CatalogVariantImageEntity[]>
  findById(id: string): Promise<CatalogVariantImageEntity | null>
  countByVariantId(variantId: string): Promise<number>
  create(data: CreateCatalogVariantImageData): Promise<CatalogVariantImageEntity>
  delete(id: string): Promise<void>
  updatePositions(variantId: string, orderedIds: string[]): Promise<void>
  promoteFirstRemaining(variantId: string): Promise<void>
}
