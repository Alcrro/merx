import type { InventoryItem, InventoryMovement, PaginatedResponse, StoreInventoryItem, PaginatedStoreInventory } from '@merx/types'
import { apiClient } from './client'

export interface ListInventoryParams {
  page?: number
  limit?: number
}

export interface AdjustInventoryInput {
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  note?: string
}

export const inventoryApi = {
  list: (params?: ListInventoryParams) =>
    apiClient.get<PaginatedResponse<InventoryItem>>('/inventory', { params }).then((r) => r.data),

  get: (variantId: string) =>
    apiClient.get<InventoryItem>(`/inventory/${variantId}`).then((r) => r.data),

  adjust: (variantId: string, data: AdjustInventoryInput) =>
    apiClient.post<InventoryItem>(`/inventory/${variantId}/adjust`, data).then((r) => r.data),

  updateReorderPoint: (variantId: string, reorderPoint: number) =>
    apiClient.patch<InventoryItem>(`/inventory/${variantId}/reorder-point`, { reorderPoint }).then((r) => r.data),

  listMovements: (variantId: string) =>
    apiClient.get<InventoryMovement[]>(`/inventory/${variantId}/movements`).then((r) => r.data),
}

export const storeInventoryApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedStoreInventory>('/inventory/store', { params }).then((r) => r.data),

  setStock: (variantId: string, type: 'in' | 'out' | 'adjustment', quantity: number) =>
    apiClient.patch<StoreInventoryItem>(`/inventory/store/${variantId}/stock`, { type, quantity }).then((r) => r.data),

  setStatus: (variantId: string, isActive: boolean) =>
    apiClient.patch<StoreInventoryItem>(`/inventory/store/${variantId}/status`, { isActive }).then((r) => r.data),
}
