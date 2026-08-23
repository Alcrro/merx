import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { shippingApi } from '@merx/api-client'
import type { CreateShippingMethodInput, UpdateShippingMethodInput } from '@merx/api-client'

export const shippingKeys = {
  all: ['shipping'] as const,
  list: () => ['shipping', 'list'] as const,
}

export function useShippingMethods() {
  return useQuery({
    queryKey: shippingKeys.list(),
    queryFn: () => shippingApi.list(),
  })
}

export function useCreateShippingMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateShippingMethodInput) => shippingApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: shippingKeys.all }),
  })
}

export function useUpdateShippingMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShippingMethodInput }) =>
      shippingApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: shippingKeys.all }),
  })
}

export function useDeleteShippingMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => shippingApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: shippingKeys.all }),
  })
}

export function useReorderShippingMethods() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => shippingApi.reorder(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: shippingKeys.all }),
  })
}
