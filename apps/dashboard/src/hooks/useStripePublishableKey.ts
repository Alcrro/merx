import { useQuery } from '@tanstack/react-query'
import { configApi } from '@merx/api-client'

export function useStripePublishableKey() {
  return useQuery({
    queryKey: ['config', 'public'],
    queryFn: configApi.getPublic,
    staleTime: Infinity,
  })
}
