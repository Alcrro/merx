import { apiClient } from './client'

export interface CatalogCategory {
  id: string
  name: string
  slug: string
  parentId: string | null
  children?: CatalogCategory[]
}

export interface CatalogVariantImage {
  id: string
  catalogVariantId: string
  url: string
  altText: string | null
  position: number
  isPrimary: boolean
  createdAt: string
}

export interface CatalogVariant {
  id: string
  catalogProductId: string
  title: string
  sku: string
  suggestedPrice: number
  createdAt: string
  images?: CatalogVariantImage[]
}

export interface CatalogProduct {
  id: string
  title: string
  description: string | null
  categoryId: string | null
  productType: string | null
  status: 'pending' | 'active' | 'archived'
  aiGenerated: boolean
  createdAt: string
  updatedAt: string
  category?: CatalogCategory | null
  variants?: CatalogVariant[]
  storeCount?: number
}

export interface StoreProductVariant {
  id: string
  storeProductId: string
  catalogVariantId: string
  customPrice: number | null
  catalogVariant?: CatalogVariant
}

export interface StoreProduct {
  id: string
  storeId: string
  catalogProductId: string
  addedAt: string
  shippingCost: number
  catalogProduct?: CatalogProduct
  variants?: StoreProductVariant[]
}

export interface SearchCatalogParams {
  search?: string
  categoryId?: string
  page?: number
  limit?: number
}

export interface PaginatedCatalog {
  data: CatalogProduct[]
  total: number
  page: number
  limit: number
}

export interface PeriodStats {
  revenue: number
  unitsSold: number
  orders: number
}

export interface VariantStat {
  catalogVariantId: string
  title: string
  sku: string
  effectivePrice: number
  unitsSold: number
  revenue: number
  topCity: string | null
  topCityOrders: number
  topCountry: string | null
  topCountryOrders: number
}

export interface StoreProductAnalytics {
  totals: PeriodStats
  last7d: PeriodStats
  last14d: PeriodStats
  last30d: PeriodStats
  monthlySales: { month: string; revenue: number; unitsSold: number }[]
  variantStats: {
    alltime: VariantStat[]
    last7d: VariantStat[]
    last14d: VariantStat[]
    last30d: VariantStat[]
  }
  geo: {
    alltime: { cities: { name: string; orders: number }[]; countries: { name: string; orders: number }[] }
    last7d: { cities: { name: string; orders: number }[]; countries: { name: string; orders: number }[] }
    last14d: { cities: { name: string; orders: number }[]; countries: { name: string; orders: number }[] }
    last30d: { cities: { name: string; orders: number }[]; countries: { name: string; orders: number }[] }
  }
  buyers: {
    alltime: { total: number; repeatBuyers: number; repeatRate: number; avgBuyerLtv: number }
    last7d: { total: number; repeatBuyers: number; repeatRate: number; avgBuyerLtv: number }
    last14d: { total: number; repeatBuyers: number; repeatRate: number; avgBuyerLtv: number }
    last30d: { total: number; repeatBuyers: number; repeatRate: number; avgBuyerLtv: number }
  }
  frequentlyBoughtWith: { storeProductId: string; catalogProductId: string; title: string; coOrders: number }[]
}

export interface StoreProductVariantAnalytics {
  variantTitle: string
  sku: string
  effectivePrice: number
  totals: PeriodStats
  last7d: PeriodStats
  last14d: PeriodStats
  last30d: PeriodStats
  monthlySales: { month: string; revenue: number; unitsSold: number }[]
  geo: {
    alltime: { cities: { name: string; orders: number }[]; countries: { name: string; orders: number }[] }
    last7d: { cities: { name: string; orders: number }[]; countries: { name: string; orders: number }[] }
    last14d: { cities: { name: string; orders: number }[]; countries: { name: string; orders: number }[] }
    last30d: { cities: { name: string; orders: number }[]; countries: { name: string; orders: number }[] }
  }
  buyers: {
    alltime: { total: number; repeatBuyers: number; repeatRate: number; avgBuyerLtv: number }
    last7d: { total: number; repeatBuyers: number; repeatRate: number; avgBuyerLtv: number }
    last14d: { total: number; repeatBuyers: number; repeatRate: number; avgBuyerLtv: number }
    last30d: { total: number; repeatBuyers: number; repeatRate: number; avgBuyerLtv: number }
  }
  frequentlyBoughtWith: { storeProductId: string; catalogProductId: string; title: string; coOrders: number }[]
}

export interface ArchiveCriteria {
  id: string
  name: string
  description: string | null
  criteriaType: string
  thresholdValue: number | null
  isActive: boolean
  createdAt: string
}

export interface AdminSearchCatalogParams extends SearchCatalogParams {
  status?: 'pending' | 'active' | 'archived'
}

export const adminCatalogApi = {
  search: (params?: AdminSearchCatalogParams): Promise<PaginatedCatalog> =>
    apiClient.get('/admin/catalog', { params }).then((r) => r.data),

  update: (id: string, data: { title?: string; description?: string; categoryId?: string | null; productType?: string | null; status?: string }) =>
    apiClient.patch(`/admin/catalog/${id}`, data).then((r) => r.data),

  archive: (id: string): Promise<void> =>
    apiClient.delete(`/admin/catalog/${id}`).then((r) => r.data),

  addVariant: (catalogProductId: string, data: { title: string; sku: string; suggestedPrice: number }): Promise<CatalogVariant> =>
    apiClient.post(`/admin/catalog/${catalogProductId}/variants`, data).then((r) => r.data),

  generateVariants: (catalogProductId: string, hint: string): Promise<{ title: string; sku: string; suggestedPrice: number }[]> =>
    apiClient.post(`/admin/catalog/${catalogProductId}/generate-variants`, { hint }).then((r) => r.data),

  uploadVariantImage: (catalogProductId: string, variantId: string, file: File): Promise<CatalogVariantImage> => {
    const form = new FormData()
    form.append('image', file)
    return apiClient.post(`/admin/catalog/${catalogProductId}/variants/${variantId}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  deleteVariantImage: (catalogProductId: string, variantId: string, imageId: string): Promise<void> =>
    apiClient.delete(`/admin/catalog/${catalogProductId}/variants/${variantId}/images/${imageId}`).then((r) => r.data),
}

export const archiveCriteriaApi = {
  list: (): Promise<ArchiveCriteria[]> =>
    apiClient.get('/admin/catalog/archive-criteria').then((r) => r.data),

  create: (data: { name: string; description?: string; criteriaType: string; thresholdValue?: number }): Promise<ArchiveCriteria> =>
    apiClient.post('/admin/catalog/archive-criteria', data).then((r) => r.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/admin/catalog/archive-criteria/${id}`).then((r) => r.data),

  run: (): Promise<{ archived: number }> =>
    apiClient.post('/admin/catalog/archive-criteria/run').then((r) => r.data),
}

export const catalogApi = {
  search: (params?: SearchCatalogParams): Promise<PaginatedCatalog> =>
    apiClient.get('/catalog', { params }).then((r) => r.data),

  getById: (id: string): Promise<CatalogProduct> =>
    apiClient.get(`/catalog/${id}`).then((r) => r.data),

  getCategories: (): Promise<CatalogCategory[]> =>
    apiClient.get('/catalog/categories').then((r) => r.data),

  addToStore: (catalogProductId: string, variantIds: string[]): Promise<StoreProduct> =>
    apiClient.post(`/catalog/${catalogProductId}/add-to-store`, { variantIds }).then((r) => r.data),

  addVariant: (catalogProductId: string, data: { title: string; sku: string; suggestedPrice: number }) =>
    apiClient.post(`/catalog/${catalogProductId}/variants`, data).then((r) => r.data),

  getMyStoreProducts: (): Promise<StoreProduct[]> =>
    apiClient.get('/catalog/my').then((r) => r.data),

  getStoreProduct: (storeProductId: string): Promise<StoreProduct> =>
    apiClient.get(`/catalog/my/${storeProductId}`).then((r) => r.data),

  updateStoreProduct: (storeProductId: string, data: { shippingCost?: number }): Promise<StoreProduct> =>
    apiClient.patch(`/catalog/my/${storeProductId}`, data).then((r) => r.data),

  getStoreProductAnalytics: (storeProductId: string): Promise<StoreProductAnalytics> =>
    apiClient.get(`/catalog/my/${storeProductId}/analytics`).then((r) => r.data),

  getStoreProductVariantAnalytics: (storeProductId: string, catalogVariantId: string): Promise<StoreProductVariantAnalytics> =>
    apiClient.get(`/catalog/my/${storeProductId}/variants/${catalogVariantId}/analytics`).then((r) => r.data),

  addVariantToStore: (storeProductId: string, catalogVariantId: string): Promise<StoreProductVariant> =>
    apiClient.post(`/catalog/my/${storeProductId}/variants/${catalogVariantId}`).then((r) => r.data),

  removeVariantFromStore: (storeProductId: string, catalogVariantId: string): Promise<void> =>
    apiClient.delete(`/catalog/my/${storeProductId}/variants/${catalogVariantId}`).then((r) => r.data),

  updateVariantPrice: (
    storeProductId: string,
    catalogVariantId: string,
    customPrice: number | null
  ): Promise<StoreProductVariant> =>
    apiClient
      .patch(`/catalog/my/${storeProductId}/variants/${catalogVariantId}/price`, { customPrice })
      .then((r) => r.data),
}
