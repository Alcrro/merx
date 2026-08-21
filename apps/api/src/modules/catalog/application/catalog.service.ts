import type { ICatalogRepository, CreateCatalogProductData, UpdateCatalogProductData, CreateCatalogVariantData } from '../domain/ports'
import type {
  CatalogProductEntity,
  CatalogVariantEntity,
  CatalogCategoryEntity,
  PaginatedCatalogProducts,
  SearchCatalogParams,
  StoreProductEntity,
  StoreProductVariantEntity,
} from '../domain/entities'

export class CatalogError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'CONFLICT' | 'INVALID' | 'FORBIDDEN'
  ) {
    super(message)
    this.name = 'CatalogError'
  }
}

export class CatalogService {
  constructor(private readonly repo: ICatalogRepository) {}

  search(params: SearchCatalogParams): Promise<PaginatedCatalogProducts> {
    return this.repo.findMany({ ...params, status: 'active' })
  }

  async getById(id: string): Promise<CatalogProductEntity> {
    const product = await this.repo.findById(id)
    if (!product) throw new CatalogError('Catalog product not found', 'NOT_FOUND')
    return product
  }

  async addToStore(storeId: string, catalogProductId: string, variantIds: string[]): Promise<StoreProductEntity> {
    const product = await this.repo.findById(catalogProductId)
    if (!product) throw new CatalogError('Catalog product not found', 'NOT_FOUND')
    if (product.status !== 'active') throw new CatalogError('Product is not active', 'INVALID')
    return this.repo.addToStore(storeId, catalogProductId, variantIds)
  }

  getStoreProducts(storeId: string): Promise<StoreProductEntity[]> {
    return this.repo.getStoreProducts(storeId)
  }

  async getStoreProduct(storeProductId: string, storeId: string): Promise<StoreProductEntity> {
    const sp = await this.repo.findStoreProductById(storeProductId, storeId)
    if (!sp) throw new CatalogError('Store product not found', 'NOT_FOUND')
    return sp
  }

  async updateStoreProduct(storeProductId: string, storeId: string, data: { shippingCost?: number }): Promise<StoreProductEntity> {
    const sp = await this.repo.findStoreProductById(storeProductId, storeId)
    if (!sp) throw new CatalogError('Store product not found', 'NOT_FOUND')
    return this.repo.updateStoreProduct(storeProductId, data)
  }

  async updateVariantPrice(
    storeProductId: string,
    storeId: string,
    catalogVariantId: string,
    customPrice: number | null
  ): Promise<StoreProductVariantEntity> {
    const sp = await this.repo.findStoreProductById(storeProductId, storeId)
    if (!sp) throw new CatalogError('Store product not found', 'NOT_FOUND')
    if (customPrice !== null && customPrice < 0) {
      throw new CatalogError('Price cannot be negative', 'INVALID')
    }
    return this.repo.updateStoreVariantPrice(storeProductId, catalogVariantId, customPrice)
  }

  async addVariantToStore(storeProductId: string, catalogVariantId: string, storeId: string): Promise<StoreProductVariantEntity> {
    const sp = await this.repo.findStoreProductById(storeProductId, storeId)
    if (!sp) throw new CatalogError('Store product not found', 'NOT_FOUND')
    return this.repo.addStoreVariant(storeProductId, catalogVariantId)
  }

  async removeVariantFromStore(storeProductId: string, catalogVariantId: string, storeId: string): Promise<void> {
    const sp = await this.repo.findStoreProductById(storeProductId, storeId)
    if (!sp) throw new CatalogError('Store product not found', 'NOT_FOUND')
    await this.repo.removeStoreVariant(storeProductId, catalogVariantId)
  }

  listCategories(): Promise<CatalogCategoryEntity[]> {
    return this.repo.findCategories()
  }

  // Admin operations

  adminSearch(params: SearchCatalogParams): Promise<PaginatedCatalogProducts> {
    return this.repo.findMany(params)
  }

  async adminCreate(data: CreateCatalogProductData): Promise<CatalogProductEntity> {
    return this.repo.create(data)
  }

  async adminUpdate(id: string, data: UpdateCatalogProductData): Promise<CatalogProductEntity> {
    const product = await this.repo.findById(id)
    if (!product) throw new CatalogError('Catalog product not found', 'NOT_FOUND')
    if (product.status === 'archived') throw new CatalogError('Cannot update an archived product', 'INVALID')
    return this.repo.update(id, data)
  }

  async adminArchive(id: string): Promise<CatalogProductEntity> {
    const product = await this.repo.findById(id)
    if (!product) throw new CatalogError('Catalog product not found', 'NOT_FOUND')
    if (product.status === 'archived') throw new CatalogError('Product is already archived', 'CONFLICT')

    const referenced = await this.repo.isReferenced(id)
    if (referenced) {
      // Referenced products can be archived (they show as "indisponibil" in stores)
      // but not hard-deleted — archive is safe
    }

    return this.repo.archive(id)
  }

  async adminAddVariant(catalogProductId: string, data: CreateCatalogVariantData): Promise<CatalogVariantEntity> {
    const product = await this.repo.findById(catalogProductId)
    if (!product) throw new CatalogError('Catalog product not found', 'NOT_FOUND')
    if (product.status !== 'active') throw new CatalogError('Variants can only be added to active products', 'INVALID')
    if (data.suggestedPrice < 0) throw new CatalogError('Price cannot be negative', 'INVALID')
    return this.repo.createVariant(catalogProductId, data)
  }
}
