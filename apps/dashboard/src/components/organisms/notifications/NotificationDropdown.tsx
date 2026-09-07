import { Link } from 'react-router-dom'
import { NotificationDropdownItem } from '../../molecules/NotificationDropdownItem'
import type { Notification } from '@merx/types'

interface Props {
  notifications: Notification[]
  isLoading: boolean
  onMarkAllRead: () => void
  onMarkRead: (id: string) => void
}

export function NotificationDropdown({ notifications, isLoading, onMarkAllRead, onMarkRead }: Props) {
  const visible = notifications.slice(0, 15)

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5 dark:ring-white/5 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Notificări</span>
        <button
          onClick={onMarkAllRead}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
        >
          Marchează toate
        </button>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading && visible.length === 0 ? (
          <div className="space-y-1 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 px-3 py-2.5 animate-pulse">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">Nicio notificare încă</p>
          </div>
        ) : (
          <div className="p-1.5 space-y-0.5">
            {visible.map((n) => (
              <NotificationDropdownItem
                key={n.id}
                notification={n}
                onRead={() => onMarkRead(n.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5">
        <Link
          to="/notifications"
          className="block text-center text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
        >
          Vezi toate notificările
        </Link>
      </div>
    </div>
  )
}
