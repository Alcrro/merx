import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@merx/api-client'

const analyticsKeys = {
  overview: (days: number) => ['analytics', 'overview', days] as const,
  revenueChart: (days: number) => ['analytics', 'revenue-chart', days] as const,
  topProducts: (days: number, by: 'revenue' | 'units') => ['analytics', 'top-products', days, by] as const,
}

export function useAnalyticsOverview(days = 30) {
  return useQuery({
    queryKey: analyticsKeys.overview(days),
    queryFn: () => analyticsApi.overview(days),
  })
}

export function useRevenueChart(days = 30) {
  return useQuery({
    queryKey: analyticsKeys.revenueChart(days),
    queryFn: () => analyticsApi.revenueChart(days),
  })
}

export function useTopProducts(days = 30, by: 'revenue' | 'units' = 'revenue') {
  return useQuery({
    queryKey: analyticsKeys.topProducts(days, by),
    queryFn: () => analyticsApi.topProducts(days, by),
  })
}
