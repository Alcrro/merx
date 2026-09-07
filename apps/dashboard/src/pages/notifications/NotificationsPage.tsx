import { useEffect, useRef, useState } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import { NotificationsTable } from '../../components/organisms/notifications/NotificationsTable'
import type { NotificationSeverity } from '@merx/types'

const SEVERITY_OPTS: { label: string; value: NotificationSeverity | 'all' }[] = [
  { label: 'Toate', value: 'all' },
  { label: 'Info', value: 'INFO' },
  { label: 'Succes', value: 'SUCCESS' },
  { label: 'Atenție', value: 'WARNING' },
  { label: 'Erori', value: 'ERROR' },
]

const DATE_OPTS: { label: string; value: 'today' | '3d' | '7d' | '14d' | '30d' }[] = [
  { label: 'Azi', value: 'today' },
  { label: '3 zile', value: '3d' },
  { label: '7 zile', value: '7d' },
  { label: '14 zile', value: '14d' },
  { label: '30 zile', value: '30d' },
]

const btnBase = 'px-3 py-1.5 rounded-lg text-sm transition'
const btnActive = 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-medium'
const btnInactive = 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'

export function NotificationsPage() {
  const { notifications, unreadCount, total, isLoading, filters, markRead, markAllRead, setFilters } = useNotifications()
  const [severity, setSeverity] = useState<NotificationSeverity | 'all'>('all')
  const [dateRange, setDateRange] = useState<'today' | '3d' | '7d' | '14d' | '30d'>('30d')
  const [search, setSearch] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleSeverity(v: NotificationSeverity | 'all') {
    setSeverity(v)
    setFilters({ severity: v === 'all' ? undefined : v, page: 1 })
  }

  function handleDateRange(v: typeof dateRange) {
    setDateRange(v)
    setFilters({ dateRange: v, page: 1 })
  }

  function handleSearch(v: string) {
    setSearch(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setFilters({ search: v || undefined, page: 1 }), 300)
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  function handlePage(page: number) {
    setFilters({ page })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notificări</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              {unreadCount} necitite
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => void markAllRead()}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
          >
            Marchează toate ca citite
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          {SEVERITY_OPTS.map((o) => (
            <button
              key={o.value}
              onClick={() => handleSeverity(o.value)}
              className={[btnBase, severity === o.value ? btnActive : btnInactive].join(' ')}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-center gap-1">
          {DATE_OPTS.map((o) => (
            <button
              key={o.value}
              onClick={() => handleDateRange(o.value)}
              className={[btnBase, dateRange === o.value ? btnActive : btnInactive].join(' ')}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Caută..."
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
        />
      </div>

      {isLoading && notifications.length === 0 ? (
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 py-16 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">Se încarcă...</p>
        </div>
      ) : (
        <NotificationsTable
          notifications={notifications}
          total={total}
          page={filters.page ?? 1}
          limit={filters.limit ?? 20}
          onPageChange={handlePage}
          onRead={markRead}
        />
      )}
    </div>
  )
}
