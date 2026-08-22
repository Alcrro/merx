import type { AnalyticsOrder, CoProduct, CustomerLtvRow, StoreProductAnalyticsContext } from '../types'

export interface IAnalyticsRepository {
  findStoreProductContext(storeProductId: string, storeId: string): Promise<StoreProductAnalyticsContext | null>
  findStoreProductVariantContext(storeProductId: string, storeId: string, catalogVariantId: string): Promise<StoreProductAnalyticsContext | null>
  findOrdersByTitlePrefix(storeId: string, titlePrefix: string): Promise<AnalyticsOrder[]>
  findOrdersByExactTitle(storeId: string, exactTitle: string): Promise<AnalyticsOrder[]>
  findCustomerLtv(storeId: string, customerIds: string[]): Promise<CustomerLtvRow[]>
  findCoProducts(storeId: string, excludeCatalogProductId: string): Promise<CoProduct[]>
  findOtherItemsInOrdersByPrefix(orderIds: string[], excludePrefix: string): Promise<{ title: string; orderId: string }[]>
  findOtherItemsInOrdersByTitle(orderIds: string[], excludeTitle: string): Promise<{ title: string; orderId: string }[]>
}
