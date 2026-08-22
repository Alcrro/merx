export type CatalogProductStatus = 'pending' | 'active' | 'archived'

export interface CatalogCategoryDto {
  id: string
  name: string
  slug: string
  parentId: string | null
  parent?: CatalogCategoryDto | null
  children?: CatalogCategoryDto[]
}

export interface CatalogVariantImageDto {
  id: string
  catalogVariantId: string
  url: string
  altText: string | null
  position: number
  isPrimary: boolean
  createdAt: Date
}

export interface CatalogVariantDto {
  id: string
  catalogProductId: string
  title: string
  sku: string
  suggestedPrice: number
  createdAt: Date
  images?: CatalogVariantImageDto[]
}

export interface CatalogProductDto {
  id: string
  title: string
  description: string | null
  categoryId: string | null
  productType: string | null
  status: CatalogProductStatus
  aiGenerated: boolean
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  category?: CatalogCategoryDto | null
  variants?: CatalogVariantDto[]
  storeCount?: number
}

export interface StoreProductVariantDto {
  id: string
  storeProductId: string
  catalogVariantId: string
  customPrice: number | null
  catalogVariant?: CatalogVariantDto
}

export interface StoreProductDto {
  id: string
  storeId: string
  catalogProductId: string
  addedAt: Date
  shippingCost: number
  catalogProduct?: CatalogProductDto
  variants?: StoreProductVariantDto[]
}

export interface PaginatedCatalogProductsDto {
  data: CatalogProductDto[]
  total: number
  page: number
  limit: number
}

export interface ArchiveCriteriaDto {
  id: string
  name: string
  criteriaKey: string
  value: string
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}
