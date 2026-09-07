import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Notification, NotificationSeverity, NotificationType } from '@merx/types'
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
  return `acum ${d}z`
}

const typeLabel: Record<NotificationType, string> = {
  ORDER_NEW:             'Comandă nouă',
  ORDER_CANCELLED:       'Comandă anulată',
  REFUND_REQUESTED:      'Retur solicitat',
  REFUND_PROCESSED:      'Retur procesat',
  STOCK_LOW:        'Stoc scăzut',
  STOCK_OUT:        'Stoc epuizat',
  STOCK_IN:         'Recepție stoc',
  STOCK_REMOVAL:    'Eliminare stoc',
  STOCK_ADJUSTMENT: 'Corecție stoc',
  PAYMENT_FAILED:        'Plată eșuată',
  CHARGEBACK_OPENED:     'Chargeback',
  AI_ACTION:             'AI Agent',
  SYSTEM_WEBHOOK_FAILED: 'Eroare sistem',
}

const severityBadge: Record<NotificationSeverity, string> = {
  INFO:    'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
  SUCCESS: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400',
  WARNING: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
  ERROR:   'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400',
}

const unreadDot: Record<NotificationSeverity, string> = {
  INFO:    'text-blue-500',
  SUCCESS: 'text-green-500',
  WARNING: 'text-amber-500',
  ERROR:   'text-red-500',
}

function resolveHref(n: Notification): string | null {
  const m = n.metadata as Record<string, unknown> | null
  if (!m) return null
  if (m.orderId) return `/orders/${m.orderId}`
  if (m.orderNumber != null && m.orderCreatedAt) {
    return `/orders/${orderSlug(m.orderNumber as number, m.orderCreatedAt as string)}`
  }
  if (m.storeProductVariantId) return `/inventory`
  if (m.productId) return `/products/${m.productId}`
  return null
}

function fmt(v: unknown): string {
  if (v == null) return '—'
  return String(v)
}

function fmtAmount(v: unknown, currency = 'EUR'): string {
  const n = Number(v)
  if (isNaN(n)) return '—'
  return `${currency} ${n.toFixed(2)}`
}

function Summary({ n }: { n: Notification }) {
  const m = (n.metadata ?? {}) as Record<string, unknown>

  const rows: { label: string; value: string }[] = []

  if (m.customerEmail) rows.push({ label: 'Client', value: fmt(m.customerEmail) })
  if (m.total != null) rows.push({ label: 'Total', value: fmtAmount(m.total) })
  if (m.amount != null) rows.push({ label: 'Sumă', value: fmtAmount(m.amount) })
  if (m.productTitle) rows.push({ label: 'Produs', value: fmt(m.productTitle) })
  if (m.variantTitle) rows.push({ label: 'Variantă', value: fmt(m.variantTitle) })
  if (m.quantity != null) rows.push({ label: 'Stoc curent', value: `${fmt(m.quantity)} buc` })
  if (m.threshold != null) rows.push({ label: 'Prag alertă', value: `${fmt(m.threshold)} buc` })
  if (m.currentStock != null) rows.push({ label: 'Stoc curent', value: `${fmt(m.currentStock)} buc` })
  if (m.stripeId) rows.push({ label: 'Ref. Stripe', value: fmt(m.stripeId) })

  if (rows.length === 0 && n.message) {
    return <p className="text-sm text-gray-600 dark:text-gray-400">{n.message}</p>
  }

  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-1">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex items-baseline gap-1.5">
          <dt className="text-xs text-gray-400 dark:text-gray-500">{label}</dt>
          <dd className="text-sm text-gray-700 dark:text-gray-300">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

interface Props {
  notification: Notification
  onRead: (id: string) => void
}

export function NotificationRow({ notification: n, onRead }: Props) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const href = resolveHref(n)
  const isUnread = !n.readAt

  function handleToggle() {
    if (!n.readAt) onRead(n.id)
    setExpanded((e) => !e)
  }

  return (
    <>
      <tr
        onClick={handleToggle}
        className={[
          'cursor-pointer border-b border-gray-100 dark:border-gray-800 transition-colors',
          'hover:bg-gray-50 dark:hover:bg-gray-800/40',
          isUnread && !expanded ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : '',
        ].join(' ')}
      >
        <td className="pl-4 pr-2 py-3 w-5 text-center">
          <span className={isUnread ? unreadDot[n.severity] : 'text-gray-200 dark:text-gray-700'}>●</span>
        </td>

        <td className="px-3 py-3 text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap w-28">
          {relativeTime(n.createdAt)}
        </td>

        <td className="px-3 py-3 w-36 whitespace-nowrap">
          <span className={['inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', severityBadge[n.severity]].join(' ')}>
            {typeLabel[n.type]}
          </span>
        </td>

        <td className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
          {n.title}
        </td>

        <td className="pl-2 pr-4 py-3 w-6 text-right text-gray-400 dark:text-gray-600 text-xs">
          {expanded ? '▲' : '▼'}
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/20">
          <td colSpan={5} className="pl-12 pr-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <Summary n={n} />
              {href && (
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(href) }}
                  className="shrink-0 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition font-medium"
                >
                  Deschide →
                </button>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
