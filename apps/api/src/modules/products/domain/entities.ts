export type ProductStatus = 'active' | 'draft' | 'archived'

export interface ProductVariantEntity {
  id: string
  productId: string
  sku: string
  title: string
  price: number
  compareAtPrice: number | null
  cost: number | null
  weight: number | null
  createdAt: Date
  updatedAt: Date
}

export interface ProductEntity {
  id: string
  storeId: string
  categoryId: string | null
  brandId: string | null
  title: string
  description: string | null
  status: ProductStatus
  productType: string | null
  createdAt: Date
  updatedAt: Date
  variants?: ProductVariantEntity[]
  category?: ProductCategoryEntity | null
  brand?: BrandEntity | null
  tags?: TagEntity[]
}

export interface ProductCategoryEntity {
  id: string
  storeId: string
  name: string
  slug: string
  parentId: string | null
  createdAt: Date
  children?: ProductCategoryEntity[]
}

export interface BrandEntity {
  id: string
  storeId: string
  name: string
  slug: string
  logoUrl: string | null
}

export interface TagEntity {
  id: string
  storeId: string
  name: string
  slug: string
  type: string
}

export interface ListProductsParams {
  storeId: string
  status?: ProductStatus
  categoryId?: string
  page: number
  limit: number
}

export interface PaginatedProducts {
  data: ProductEntity[]
  total: number
  page: number
  limit: number
}
