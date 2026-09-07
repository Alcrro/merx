import type { Notification, NotificationFilters, NotificationsResponse } from '@merx/types'
import { apiClient } from './client'

export const notificationApi = {
  list: (storeId: string, filters?: NotificationFilters) =>
    apiClient
      .get<NotificationsResponse>(`/stores/${storeId}/notifications`, { params: filters })
      .then((r) => r.data),

  markRead: (storeId: string, id: string) =>
    apiClient
      .post<{ ok: boolean }>(`/stores/${storeId}/notifications/${id}/read`)
      .then((r) => r.data),

  markAllRead: (storeId: string) =>
    apiClient
      .post<{ updated: number }>(`/stores/${storeId}/notifications/read-all`)
      .then((r) => r.data),
}

export type { Notification, NotificationFilters, NotificationsResponse }
