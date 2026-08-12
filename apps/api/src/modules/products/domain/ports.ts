import type {
  ProductEntity,
  ProductVariantEntity,
  ProductCategoryEntity,
  ListProductsParams,
  PaginatedProducts,
  ProductStatus,
} from './entities'

export interface IProductRepository {
  list(params: ListProductsParams): Promise<PaginatedProducts>
  findById(id: string, storeId: string): Promise<ProductEntity | null>
  create(storeId: string, data: CreateProductData): Promise<ProductEntity>
  update(id: string, storeId: string, data: UpdateProductData): Promise<ProductEntity>
  delete(id: string, storeId: string): Promise<void>
  hasActiveOrders(productId: string): Promise<boolean>

  createVariant(productId: string, storeId: string, data: CreateVariantData): Promise<ProductVariantEntity>
  updateVariant(variantId: string, productId: string, storeId: string, data: UpdateVariantData): Promise<ProductVariantEntity>
  deleteVariant(variantId: string, productId: string, storeId: string): Promise<void>
  countVariants(productId: string): Promise<number>

  listCategories(storeId: string): Promise<ProductCategoryEntity[]>
  createCategory(storeId: string, name: string, slug: string): Promise<ProductCategoryEntity>
}

export interface CreateProductData {
  categoryId?: string | null
  title: string
  description?: string | null
  status?: ProductStatus
  productType?: string | null
  vendor?: string | null
}

export interface UpdateProductData {
  categoryId?: string | null
  title?: string
  description?: string | null
  status?: ProductStatus
  productType?: string | null
  vendor?: string | null
}

export interface CreateVariantData {
  sku: string
  title: string
  price: number
  compareAtPrice?: number | null
  cost?: number | null
  weight?: number | null
}

export interface UpdateVariantData {
  sku?: string
  title?: string
  price?: number
  compareAtPrice?: number | null
  cost?: number | null
  weight?: number | null
}
