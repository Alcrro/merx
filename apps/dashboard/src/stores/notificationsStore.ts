import { create } from 'zustand'
import { notificationApi } from '@merx/api-client'
import type { Notification, NotificationFilters } from '@merx/types'

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  total: number
  isLoading: boolean
  filters: NotificationFilters

  fetch: (storeId: string) => Promise<void>
  markRead: (storeId: string, id: string) => Promise<void>
  markAllRead: (storeId: string) => Promise<void>
  setFilters: (storeId: string, f: Partial<NotificationFilters>) => void
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  total: 0,
  isLoading: false,
  filters: { limit: 20, page: 1, dateRange: 'today' },

  fetch: async (storeId) => {
    set({ isLoading: true })
    try {
      const result = await notificationApi.list(storeId, get().filters)
      set({ notifications: result.notifications, unreadCount: result.unreadCount, total: result.total })
    } catch {
      // silent — polling failure should not surface to user
    } finally {
      set({ isLoading: false })
    }
  },

  markRead: async (storeId, id) => {
    await notificationApi.markRead(storeId, id)
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }))
  },

  markAllRead: async (storeId) => {
    await notificationApi.markAllRead(storeId)
    const now = new Date().toISOString()
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, readAt: n.readAt ?? now })),
      unreadCount: 0,
    }))
  },

  setFilters: (storeId, f) => {
    set((s) => ({ filters: { ...s.filters, ...f, page: 1 } }))
    void get().fetch(storeId)
  },
}))
