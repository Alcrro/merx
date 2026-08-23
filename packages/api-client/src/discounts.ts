import { apiClient } from './client'

export type DiscountType = 'percentage' | 'fixed'

export interface DiscountCode {
  id: string
  storeId: string
  code: string
  type: DiscountType
  value: number
  currency: string
  minOrderAmount: number | null
  maxUses: number | null
  usedCount: number
  startsAt: string | null
  expiresAt: string | null
  isActive: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedDiscounts {
  data: DiscountCode[]
  total: number
  page: number
  limit: number
}

export interface ListDiscountsParams {
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface CreateDiscountInput {
  code: string
  type: DiscountType
  value: number
  minOrderAmount?: number
  maxUses?: number
  startsAt?: string
  expiresAt?: string
  isActive?: boolean
}

export interface UpdateDiscountInput {
  value?: number
  minOrderAmount?: number | null
  maxUses?: number | null
  startsAt?: string | null
  expiresAt?: string | null
  isActive?: boolean
}

export const discountApi = {
  list: (params?: ListDiscountsParams): Promise<PaginatedDiscounts> =>
    apiClient.get('/discounts', { params }).then((r) => r.data),

  create: (data: CreateDiscountInput): Promise<DiscountCode> =>
    apiClient.post('/discounts', data).then((r) => r.data),

  update: (id: string, data: UpdateDiscountInput): Promise<DiscountCode> =>
    apiClient.patch(`/discounts/${id}`, data).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    apiClient.delete(`/discounts/${id}`).then(() => undefined),
}
