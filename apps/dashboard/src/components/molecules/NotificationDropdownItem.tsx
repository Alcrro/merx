import { useNavigate } from 'react-router-dom'
import type { Notification, NotificationSeverity } from '@merx/types'
import { orderSlug } from '../../lib/orderSlug'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'acum'
  const m = Math.floor(s / 60)
  if (m < 60) return `acum ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `acum ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'ieri'
  return `acum ${d} zile`
}

const severityDot: Record<NotificationSeverity, string> = {
  INFO: 'bg-blue-500',
  SUCCESS: 'bg-green-500',
  WARNING: 'bg-amber-500',
  ERROR: 'bg-red-500',
}

function resolveHref(n: Notification): string | null {
  const m = n.metadata as Record<string, unknown> | null
  if (!m) return null
  if (m.orderNumber != null && m.orderCreatedAt) {
    return `/orders/${orderSlug(m.orderNumber as number, m.orderCreatedAt as string)}`
  }
  if (m.storeProductVariantId) return `/inventory`
  if (m.productId) return `/products/${m.productId}`
  return null
}

interface Props {
  notification: Notification
  onRead: () => void
}

export function NotificationDropdownItem({ notification: n, onRead }: Props) {
  const navigate = useNavigate()
  const href = resolveHref(n)
  const isUnread = !n.readAt

  function handleClick() {
    onRead()
    if (href) navigate(href)
  }

  return (
    <button
      onClick={handleClick}
      className={[
        'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition',
        'hover:bg-gray-50 dark:hover:bg-gray-800/60',
        isUnread ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : '',
      ].join(' ')}
    >
      <span className={['mt-1.5 h-2 w-2 rounded-full shrink-0', severityDot[n.severity]].join(' ')} />
      <div className="min-w-0 flex-1">
        <p className={['text-sm truncate', isUnread ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'].join(' ')}>
          {n.title}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{n.message}</p>
      </div>
      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">{relativeTime(n.createdAt)}</span>
    </button>
  )
}
