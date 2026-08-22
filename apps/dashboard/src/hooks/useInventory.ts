import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryApi, storeInventoryApi } from '@merx/api-client'
import type { AdjustInventoryInput, ListInventoryParams } from '@merx/api-client'

export const inventoryKeys = {
  all: ['inventory'] as const,
  list: (params?: ListInventoryParams) => ['inventory', 'list', params] as const,
  detail: (variantId: string) => ['inventory', 'detail', variantId] as const,
  movements: (variantId: string) => ['inventory', 'movements', variantId] as const,
}

export function useInventory(params?: ListInventoryParams) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => inventoryApi.list(params),
  })
}

export function useInventoryItem(variantId: string) {
  return useQuery({
    queryKey: inventoryKeys.detail(variantId),
    queryFn: () => inventoryApi.get(variantId),
    enabled: !!variantId,
  })
}

export function useInventoryMovements(variantId: string) {
  return useQuery({
    queryKey: inventoryKeys.movements(variantId),
    queryFn: () => inventoryApi.listMovements(variantId),
    enabled: !!variantId,
  })
}

export function useAdjustInventory(variantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AdjustInventoryInput) => inventoryApi.adjust(variantId, data),
    onSuccess: (updated) => {
      qc.setQueryData(inventoryKeys.detail(variantId), updated)
      void qc.invalidateQueries({ queryKey: inventoryKeys.list() })
      void qc.invalidateQueries({ queryKey: inventoryKeys.movements(variantId) })
    },
  })
}

export function useUpdateReorderPoint(variantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reorderPoint: number) => inventoryApi.updateReorderPoint(variantId, reorderPoint),
    onSuccess: (updated) => {
      qc.setQueryData(inventoryKeys.detail(variantId), updated)
      void qc.invalidateQueries({ queryKey: inventoryKeys.list() })
    },
  })
}

const storeInventoryKeys = {
  all: ['store-inventory'] as const,
  list: (params?: object) => ['store-inventory', 'list', params] as const,
}

export function useStoreInventory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: storeInventoryKeys.list(params),
    queryFn: () => storeInventoryApi.list(params),
  })
}

export function useSetStoreStock(variantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ type, quantity }: { type: 'in' | 'out' | 'adjustment'; quantity: number }) =>
      storeInventoryApi.setStock(variantId, type, quantity),
    onSuccess: () => void qc.invalidateQueries({ queryKey: storeInventoryKeys.all }),
  })
}

export function useSetStoreVariantStatus(variantId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (isActive: boolean) => storeInventoryApi.setStatus(variantId, isActive),
    onSuccess: () => void qc.invalidateQueries({ queryKey: storeInventoryKeys.all }),
  })
}
