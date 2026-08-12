import type { Store } from '@merx/types'
import { apiClient } from './index'

export interface UpdateStoreInput {
  name?: string
  currency?: string
  locale?: string
  timezone?: string
}

export const storeApi = {
  getCurrent: () => apiClient.get<Store>('/stores/current').then((r) => r.data),

  updateCurrent: (data: UpdateStoreInput) =>
    apiClient.put<Store>('/stores/current', data).then((r) => r.data),
}
