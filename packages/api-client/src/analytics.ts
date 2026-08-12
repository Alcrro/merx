import type { AnalyticsOverview, RevenueChartPoint, TopProduct } from '@merx/types'
import { apiClient } from './index'

export const analyticsApi = {
  overview: (days = 30) =>
    apiClient.get<AnalyticsOverview>('/analytics/overview', { params: { days } }).then((r) => r.data),

  revenueChart: (days = 30) =>
    apiClient.get<RevenueChartPoint[]>('/analytics/revenue-chart', { params: { days } }).then((r) => r.data),

  topProducts: (days = 30, by: 'revenue' | 'units' = 'revenue') =>
    apiClient.get<TopProduct[]>('/analytics/top-products', { params: { days, by } }).then((r) => r.data),

  recalculate: (params?: { date?: string; startDate?: string; endDate?: string }) =>
    apiClient.post<{ queued: number }>('/analytics/recalculate', params ?? {}).then((r) => r.data),
}
