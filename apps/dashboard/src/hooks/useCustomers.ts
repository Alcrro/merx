import { useQuery } from '@tanstack/react-query'
import { customerApi } from '@merx/api-client'
import type { ListCustomersParams } from '@merx/api-client'
import type { CustomerAnalytics } from '@merx/types'

export const customerKeys = {
  all: ['customers'] as const,
  list: (params?: ListCustomersParams) => ['customers', 'list', params] as const,
  detail: (id: string) => ['customers', 'detail', id] as const,
  analytics: (id: string) => ['customers', 'analytics', id] as const,
}

export function useCustomers(params?: ListCustomersParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerApi.list(params),
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerApi.get(id),
    enabled: !!id,
  })
}

export function useCustomerAnalytics(id: string) {
  return useQuery<CustomerAnalytics>({
    queryKey: customerKeys.analytics(id),
    queryFn: () => customerApi.getAnalytics(id),
    enabled: !!id,
  })
}
