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
