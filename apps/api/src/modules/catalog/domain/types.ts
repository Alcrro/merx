export type CatalogProductStatus = 'pending' | 'active' | 'archived'
export type ImpactGrade = 'low' | 'medium' | 'high' | 'iminent'

export interface SearchCatalogParams {
  search?: string
  categoryId?: string
  status?: CatalogProductStatus
  page: number
  limit: number
}

export interface ProductForArchiveEvaluation {
  id: string
  createdAt: Date
  storeProductCount: number
  variantCount: number
  rejectedRequestCount: number
}

export interface AnalyticsOrderItem {
  orderId: string
  title: string
  quantity: number
  total: number
}

export interface AnalyticsOrder {
  id: string
  createdAt: Date
  customerId: string | null
  shippingAddress: Record<string, string> | null
  items: AnalyticsOrderItem[]
}

export interface CoProduct {
  storeProductId: string
  catalogProductId: string
  title: string
}

export interface CustomerLtvRow {
  customerId: string
  ltv: number
}

export interface StoreProductAnalyticsContext {
  id: string
  storeId: string
  catalogProductId: string
  catalogProductTitle: string
  variants: {
    catalogVariantId: string
    customPrice: number | null
    variantTitle: string
    sku: string
    suggestedPrice: number
  }[]
}
