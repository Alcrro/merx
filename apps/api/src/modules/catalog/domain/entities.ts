export type CatalogProductStatus = 'pending' | 'active' | 'archived'
export type ImpactGrade = 'low' | 'medium' | 'high' | 'iminent'

export interface CatalogCategoryEntity {
  id: string
  name: string
  slug: string
  parentId: string | null
  parent?: CatalogCategoryEntity | null
  children?: CatalogCategoryEntity[]
}

export interface CatalogVariantImageEntity {
  id: string
  catalogVariantId: string
  url: string
  altText: string | null
  position: number
  isPrimary: boolean
  createdAt: Date
}

export interface CatalogVariantEntity {
  id: string
  catalogProductId: string
  title: string
  sku: string
  suggestedPrice: number
  createdAt: Date
  images?: CatalogVariantImageEntity[]
}

export interface CatalogProductEntity {
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
  category?: CatalogCategoryEntity | null
  variants?: CatalogVariantEntity[]
  storeCount?: number
}

export interface StoreProductVariantEntity {
  id: string
  storeProductId: string
  catalogVariantId: string
  customPrice: number | null
  catalogVariant?: CatalogVariantEntity
}

export interface StoreProductEntity {
  id: string
  storeId: string
  catalogProductId: string
  addedAt: Date
  shippingCost: number
  catalogProduct?: CatalogProductEntity
  variants?: StoreProductVariantEntity[]
}

export interface SearchCatalogParams {
  search?: string
  categoryId?: string
  status?: CatalogProductStatus
  page: number
  limit: number
}

export interface PaginatedCatalogProducts {
  data: CatalogProductEntity[]
  total: number
  page: number
  limit: number
}
