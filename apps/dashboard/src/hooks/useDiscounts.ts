import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { discountApi } from '@merx/api-client'
import type { ListDiscountsParams, CreateDiscountInput, UpdateDiscountInput } from '@merx/api-client'

export const discountKeys = {
  all: ['discounts'] as const,
  list: (params?: ListDiscountsParams) => ['discounts', 'list', params] as const,
}

export function useDiscounts(params?: ListDiscountsParams) {
  return useQuery({
    queryKey: discountKeys.list(params),
    queryFn: () => discountApi.list(params),
  })
}

export function useCreateDiscount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDiscountInput) => discountApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: discountKeys.all }),
  })
}

export function useUpdateDiscount(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateDiscountInput) => discountApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: discountKeys.all }),
  })
}

export function useDeleteDiscount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => discountApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: discountKeys.all }),
  })
}
