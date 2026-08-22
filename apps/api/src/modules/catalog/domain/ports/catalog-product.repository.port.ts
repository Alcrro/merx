import type { CatalogProductEntity, PaginatedCatalogProducts } from '../entities'
import type { CatalogVariantEntity } from '../entities'
import type { SearchCatalogParams, CatalogProductStatus } from '../types'

export interface CreateCatalogProductData {
  title: string
  description?: string | null
  categoryId?: string | null
  productType?: string | null
  status?: CatalogProductStatus
  aiGenerated?: boolean
  metadata?: Record<string, unknown>
  variants?: CreateCatalogVariantData[]
}

export interface UpdateCatalogProductData {
  title?: string
  description?: string | null
  categoryId?: string | null
  productType?: string | null
  status?: CatalogProductStatus
  metadata?: Record<string, unknown>
}

export interface CreateCatalogVariantData {
  title: string
  sku: string
  suggestedPrice: number
}

export interface ICatalogProductRepository {
  findMany(params: SearchCatalogParams): Promise<PaginatedCatalogProducts>
  findById(id: string): Promise<CatalogProductEntity | null>
  create(data: CreateCatalogProductData): Promise<CatalogProductEntity>
  update(id: string, data: UpdateCatalogProductData): Promise<CatalogProductEntity>
  archive(id: string): Promise<CatalogProductEntity>
  isReferenced(id: string): Promise<boolean>
}

export interface ICatalogVariantRepository {
  createVariant(catalogProductId: string, data: CreateCatalogVariantData): Promise<CatalogVariantEntity>
  findVariant(variantId: string, catalogProductId: string): Promise<{ id: string } | null>
}
