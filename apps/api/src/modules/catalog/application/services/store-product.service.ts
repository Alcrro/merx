import type { ICatalogProductRepository, IStoreProductRepository } from '../../domain/ports'
import { Price } from '../../domain/value-objects/price.value-object'
import type { StoreProductEntity, StoreProductVariantEntity } from '../../domain/entities'
import { CatalogError } from '../../domain/errors'

export class StoreProductService {
  constructor(
    private readonly productRepo: ICatalogProductRepository,
    private readonly storeProductRepo: IStoreProductRepository,
  ) {}

  async addToStore(storeId: string, catalogProductId: string, variantIds: string[]): Promise<StoreProductEntity> {
    const product = await this.productRepo.findById(catalogProductId)
    if (!product) throw new CatalogError('Catalog product not found', 'NOT_FOUND')
    product.guardActive()
    return this.storeProductRepo.addToStore(storeId, catalogProductId, variantIds)
  }

  getStoreProducts(storeId: string): Promise<StoreProductEntity[]> {
    return this.storeProductRepo.getStoreProducts(storeId)
  }

  async getStoreProduct(storeProductId: string, storeId: string): Promise<StoreProductEntity> {
    const sp = await this.storeProductRepo.findStoreProductById(storeProductId, storeId)
    if (!sp) throw new CatalogError('Store product not found', 'NOT_FOUND')
    return sp
  }

  async updateStoreProduct(storeProductId: string, storeId: string, data: { shippingCost?: number }): Promise<StoreProductEntity> {
    const sp = await this.storeProductRepo.findStoreProductById(storeProductId, storeId)
    if (!sp) throw new CatalogError('Store product not found', 'NOT_FOUND')
    return this.storeProductRepo.updateStoreProduct(storeProductId, data)
  }

  async updateVariantPrice(
    storeProductId: string,
    storeId: string,
    catalogVariantId: string,
    customPrice: number | null,
  ): Promise<StoreProductVariantEntity> {
    const sp = await this.storeProductRepo.findStoreProductById(storeProductId, storeId)
    if (!sp) throw new CatalogError('Store product not found', 'NOT_FOUND')
    Price.ofNullable(customPrice)
    return this.storeProductRepo.updateStoreVariantPrice(storeProductId, catalogVariantId, customPrice)
  }

  async addVariantToStore(storeProductId: string, catalogVariantId: string, storeId: string): Promise<StoreProductVariantEntity> {
    const sp = await this.storeProductRepo.findStoreProductById(storeProductId, storeId)
    if (!sp) throw new CatalogError('Store product not found', 'NOT_FOUND')
    return this.storeProductRepo.addStoreVariant(storeProductId, catalogVariantId)
  }

  async removeVariantFromStore(storeProductId: string, catalogVariantId: string, storeId: string): Promise<void> {
    const sp = await this.storeProductRepo.findStoreProductById(storeProductId, storeId)
    if (!sp) throw new CatalogError('Store product not found', 'NOT_FOUND')
    await this.storeProductRepo.removeStoreVariant(storeProductId, catalogVariantId)
  }
}
