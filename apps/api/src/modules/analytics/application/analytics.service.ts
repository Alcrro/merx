import type { IAnalyticsRepository } from '../domain/ports'
import type { AnalyticsOverview, RevenueChartPoint, TopProduct } from '../domain/entities'

export class AnalyticsService {
  constructor(private readonly repo: IAnalyticsRepository) {}

  private dateRange(days: number): { startDate: Date; endDate: Date } {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)
    return { startDate, endDate }
  }

  getOverview(storeId: string, days: number): Promise<AnalyticsOverview> {
    const { startDate, endDate } = this.dateRange(days)
    return this.repo.getOverview(storeId, startDate, endDate)
  }

  getRevenueChart(storeId: string, days: number): Promise<RevenueChartPoint[]> {
    const { startDate, endDate } = this.dateRange(days)
    return this.repo.getRevenueChart(storeId, startDate, endDate)
  }

  getTopProducts(storeId: string, days: number, by: 'revenue' | 'units'): Promise<TopProduct[]> {
    const { startDate, endDate } = this.dateRange(days)
    return this.repo.getTopProducts(storeId, startDate, endDate, by)
  }

  recalculateDay(date: Date): Promise<number> {
    return this.repo.recalculateDay(date)
  }
}
