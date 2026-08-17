import type {
  ProductEntity,
  ProductVariantEntity,
  ProductCategoryEntity,
  BrandEntity,
  TagEntity,
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
  createCategory(storeId: string, data: CreateCategoryData): Promise<ProductCategoryEntity>
  deleteCategory(id: string, storeId: string): Promise<void>

  listBrands(storeId: string): Promise<BrandEntity[]>
  createBrand(storeId: string, data: CreateBrandData): Promise<BrandEntity>
  updateBrand(id: string, storeId: string, data: UpdateBrandData): Promise<BrandEntity>
  deleteBrand(id: string, storeId: string): Promise<void>

  listTags(storeId: string, type?: string): Promise<TagEntity[]>
  createTag(storeId: string, data: CreateTagData): Promise<TagEntity>
  deleteTag(id: string, storeId: string): Promise<void>
}

export interface CreateProductData {
  categoryId?: string | null
  brandId?: string | null
  title: string
  description?: string | null
  status?: ProductStatus
  productType?: string | null
  tagIds?: string[]
}

export interface UpdateProductData {
  categoryId?: string | null
  brandId?: string | null
  title?: string
  description?: string | null
  status?: ProductStatus
  productType?: string | null
  tagIds?: string[]
}

export interface CreateCategoryData {
  name: string
  slug: string
  parentId?: string | null
}

export interface CreateBrandData {
  name: string
  slug: string
  logoUrl?: string | null
}

export interface UpdateBrandData {
  name?: string
  slug?: string
  logoUrl?: string | null
}

export interface CreateTagData {
  name: string
  slug: string
  type?: string
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
