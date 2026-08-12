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
  title: string
  description: string | null
  status: ProductStatus
  productType: string | null
  vendor: string | null
  createdAt: Date
  updatedAt: Date
  variants?: ProductVariantEntity[]
  category?: ProductCategoryEntity | null
}

export interface ProductCategoryEntity {
  id: string
  storeId: string
  name: string
  slug: string
  createdAt: Date
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
