import type { CatalogProduct } from './catalog-product.entity'
import type { CatalogVariantEntity } from './catalog-variant.entity'

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
  catalogProduct?: CatalogProduct
  variants?: StoreProductVariantEntity[]
}
