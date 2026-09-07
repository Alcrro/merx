import { useEffect } from 'react'
import { useNotificationsStore } from '../stores/notificationsStore'
import { useAuth } from './useAuth'

const POLL_INTERVAL = 30_000

export function useNotifications() {
  const { store } = useAuth()
  const { fetch, markRead, markAllRead, setFilters, ...state } = useNotificationsStore()

  useEffect(() => {
    if (!store?.id) return
    void fetch(store.id)
    const id = setInterval(() => void fetch(store.id), POLL_INTERVAL)
    return () => clearInterval(id)
  }, [store?.id])

  return {
    ...state,
    markRead: (id: string) => store?.id ? markRead(store.id, id) : Promise.resolve(),
    markAllRead: () => store?.id ? markAllRead(store.id) : Promise.resolve(),
    setFilters: (f: Parameters<typeof setFilters>[1]) => { if (store?.id) setFilters(store.id, f) },
    refetch: () => { if (store?.id) void fetch(store.id) },
  }
}
