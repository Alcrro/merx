import type { StoreProductEntity, StoreProductVariantEntity } from '../entities'

export interface IStoreProductRepository {
  addToStore(storeId: string, catalogProductId: string, variantIds: string[]): Promise<StoreProductEntity>
  getStoreProducts(storeId: string): Promise<StoreProductEntity[]>
  findStoreProduct(storeId: string, catalogProductId: string): Promise<StoreProductEntity | null>
  findStoreProductById(storeProductId: string, storeId: string): Promise<StoreProductEntity | null>
  updateStoreProduct(storeProductId: string, data: { shippingCost?: number }): Promise<StoreProductEntity>
  addStoreVariant(storeProductId: string, catalogVariantId: string): Promise<StoreProductVariantEntity>
  removeStoreVariant(storeProductId: string, catalogVariantId: string): Promise<void>
  updateStoreVariantPrice(storeProductId: string, catalogVariantId: string, customPrice: number | null): Promise<StoreProductVariantEntity>
}
