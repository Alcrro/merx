import { NotificationRow } from '../../molecules/NotificationRow'
import type { Notification } from '@merx/types'

interface Props {
  notifications: Notification[]
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  onRead: (id: string) => void
}

export function NotificationsTable({ notifications, total, page, limit, onPageChange, onRead }: Props) {
  const totalPages = Math.ceil(total / limit)

  if (notifications.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
        Nicio notificare în intervalul selectat
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="pl-4 pr-2 py-2.5 w-5" />
              <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide w-28">Timp</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide w-36">Tip</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Detalii</th>
              <th className="pl-2 pr-4 py-2.5 w-8" />
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900">
            {notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} onRead={onRead} />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{total} notificări · pagina {page} din {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              ← Anterior
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Următor →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
