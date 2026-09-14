import type { Store, StoreSettings } from '@merx/types'
import { apiClient } from './client'

export interface UpdateStoreInput {
  name?: string
  currency?: string
  locale?: string
  timezone?: string
  settings?: StoreSettings
}

export const storeApi = {
  getCurrent: () => apiClient.get<Store>('/stores/current').then((r) => r.data),

  updateCurrent: (data: UpdateStoreInput) =>
    apiClient.put<Store>('/stores/current', data).then((r) => r.data),

  deleteCurrent: () => apiClient.delete('/stores/current'),
}
