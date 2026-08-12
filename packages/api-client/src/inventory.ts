import type { InventoryItem, InventoryMovement, PaginatedResponse } from '@merx/types'
import { apiClient } from './index'

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
