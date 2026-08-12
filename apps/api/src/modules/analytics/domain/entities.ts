export interface AnalyticsOverview {
  revenue: number
  cost: number
  profit: number
  orders: number
  aov: number
  revenueChange: number
  ordersChange: number
  profitChange: number
  aovChange: number
}

export interface RevenueChartPoint {
  date: string
  revenue: number
}

export interface TopProduct {
  productId: string
  productTitle: string
  unitsSold: number
  revenue: number
  profit: number
  orders: number
}
