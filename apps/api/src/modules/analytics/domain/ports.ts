import type { AnalyticsOverview, RevenueChartPoint, TopProduct } from './entities'

export interface IAnalyticsRepository {
  getOverview(storeId: string, startDate: Date, endDate: Date): Promise<AnalyticsOverview>
  getRevenueChart(storeId: string, startDate: Date, endDate: Date): Promise<RevenueChartPoint[]>
  getTopProducts(storeId: string, startDate: Date, endDate: Date, by: 'revenue' | 'units'): Promise<TopProduct[]>
  recalculateDay(date: Date): Promise<number>
}
