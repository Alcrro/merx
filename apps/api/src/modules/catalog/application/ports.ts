export interface PeriodStats {
  revenue: number
  unitsSold: number
  orders: number
}

export interface GeoStats {
  cities: { name: string; orders: number }[]
  countries: { name: string; orders: number }[]
}

export interface BuyerStats {
  total: number
  repeatBuyers: number
  repeatRate: number
  avgBuyerLtv: number
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

export interface MonthlyStat {
  month: string
  revenue: number
  unitsSold: number
}

export interface StoreProductAnalytics {
  totals: PeriodStats
  last7d: PeriodStats
  last14d: PeriodStats
  last30d: PeriodStats
  monthlySales: MonthlyStat[]
  variantStats: {
    alltime: VariantStat[]
    last7d: VariantStat[]
    last14d: VariantStat[]
    last30d: VariantStat[]
  }
  geo: {
    alltime: GeoStats
    last7d: GeoStats
    last14d: GeoStats
    last30d: GeoStats
  }
  buyers: {
    alltime: BuyerStats
    last7d: BuyerStats
    last14d: BuyerStats
    last30d: BuyerStats
  }
  frequentlyBoughtWith: {
    storeProductId: string
    catalogProductId: string
    title: string
    coOrders: number
  }[]
}

export interface StoreProductVariantAnalytics {
  variantTitle: string
  sku: string
  effectivePrice: number
  totals: PeriodStats
  last7d: PeriodStats
  last14d: PeriodStats
  last30d: PeriodStats
  monthlySales: MonthlyStat[]
  geo: {
    alltime: GeoStats
    last7d: GeoStats
    last14d: GeoStats
    last30d: GeoStats
  }
  buyers: {
    alltime: BuyerStats
    last7d: BuyerStats
    last14d: BuyerStats
    last30d: BuyerStats
  }
  frequentlyBoughtWith: { storeProductId: string; catalogProductId: string; title: string; coOrders: number }[]
}

export interface IStoreProductAnalyticsPort {
  getAnalytics(storeProductId: string, storeId: string): Promise<StoreProductAnalytics>
}

export interface IStoreProductVariantAnalyticsPort {
  getAnalytics(storeProductId: string, catalogVariantId: string, storeId: string): Promise<StoreProductVariantAnalytics>
}
