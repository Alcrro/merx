import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { insightsApi } from '@merx/api-client'

const insightKeys = {
  all: ['ai', 'insights'] as const,
}

export function useInsights() {
  return useQuery({
    queryKey: insightKeys.all,
    queryFn: () => insightsApi.list(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRunInsights() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => insightsApi.run(),
    onSuccess: () => qc.invalidateQueries({ queryKey: insightKeys.all }),
  })
}

export function useInsightsHistory(enabled: boolean) {
  return useQuery({
    queryKey: ['ai', 'insights', 'history'] as const,
    queryFn: () => insightsApi.history(),
    enabled,
    staleTime: 2 * 60 * 1000,
  })
}

export function useRestockInsight() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ insightId, quantity }: { insightId: string; quantity: number }) =>
      insightsApi.restock(insightId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: insightKeys.all }),
  })
}
