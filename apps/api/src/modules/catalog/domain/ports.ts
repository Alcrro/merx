import type {
  CatalogCategoryEntity,
  CatalogProductEntity,
  CatalogVariantEntity,
  CatalogVariantImageEntity,
  CatalogProductStatus,
  PaginatedCatalogProducts,
  SearchCatalogParams,
  StoreProductEntity,
  StoreProductVariantEntity,
} from './entities'

export interface ICatalogRepository {
  findMany(params: SearchCatalogParams): Promise<PaginatedCatalogProducts>
  findById(id: string): Promise<CatalogProductEntity | null>
  create(data: CreateCatalogProductData): Promise<CatalogProductEntity>
  update(id: string, data: UpdateCatalogProductData): Promise<CatalogProductEntity>
  archive(id: string): Promise<CatalogProductEntity>
  isReferenced(id: string): Promise<boolean>

  createVariant(catalogProductId: string, data: CreateCatalogVariantData): Promise<CatalogVariantEntity>

  addToStore(storeId: string, catalogProductId: string, variantIds: string[]): Promise<StoreProductEntity>
  getStoreProducts(storeId: string): Promise<StoreProductEntity[]>
  findStoreProduct(storeId: string, catalogProductId: string): Promise<StoreProductEntity | null>
  findStoreProductById(storeProductId: string, storeId: string): Promise<StoreProductEntity | null>
  updateStoreProduct(storeProductId: string, data: { shippingCost?: number }): Promise<StoreProductEntity>
  addStoreVariant(storeProductId: string, catalogVariantId: string): Promise<StoreProductVariantEntity>
  removeStoreVariant(storeProductId: string, catalogVariantId: string): Promise<void>
  updateStoreVariantPrice(storeProductId: string, catalogVariantId: string, customPrice: number | null): Promise<StoreProductVariantEntity>

  findCategories(): Promise<CatalogCategoryEntity[]>
  findCategoryById(id: string): Promise<CatalogCategoryEntity | null>
}

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

export interface ICatalogVariantImageRepository {
  findByVariantId(variantId: string): Promise<CatalogVariantImageEntity[]>
  findById(id: string): Promise<CatalogVariantImageEntity | null>
  countByVariantId(variantId: string): Promise<number>
  create(data: CreateCatalogVariantImageData): Promise<CatalogVariantImageEntity>
  delete(id: string): Promise<void>
  updatePositions(variantId: string, orderedIds: string[]): Promise<void>
  promoteFirstRemaining(variantId: string): Promise<void>
}

export interface CreateCatalogVariantImageData {
  catalogVariantId: string
  url: string
  altText?: string | null
  position: number
  isPrimary: boolean
}
