import type { CustomerWithStats, CustomerDetail, CustomerAnalytics, CustomerSortBy, PaginatedResponse } from '@merx/types'
import { apiClient } from './client'

export interface ListCustomersParams {
  search?: string
  sortBy?: CustomerSortBy
  page?: number
  limit?: number
}

export const customerApi = {
  list: (params?: ListCustomersParams) =>
    apiClient.get<PaginatedResponse<CustomerWithStats>>('/customers', { params }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<CustomerDetail>(`/customers/${id}`).then((r) => r.data),

  getAnalytics: (id: string) =>
    apiClient.get<CustomerAnalytics>(`/customers/${id}/analytics`).then((r) => r.data),
}
