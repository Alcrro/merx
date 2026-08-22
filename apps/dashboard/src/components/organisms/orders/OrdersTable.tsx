import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '@merx/types'
import { useOrders } from '../../../hooks/useOrders'
import { orderSlug } from '../../../lib/orderSlug'
import { formatMoney, formatRelativeDate } from '../../../lib/format'
import { Button } from '../../atoms/Button'
import { OrderStatusBadge } from '../../molecules/orders/OrderStatusBadge'

const STATUS_TABS: { label: string; value: OrderStatus | undefined }[] = [
  { label: 'Toate', value: undefined },
  { label: 'În așteptare', value: 'pending' },
  { label: 'Confirmate', value: 'confirmed' },
  { label: 'Finalizate', value: 'completed' },
  { label: 'Anulate', value: 'cancelled' },
]

const PAYMENT_OPTIONS: { label: string; value: PaymentStatus | '' }[] = [
  { label: 'Toate plățile', value: '' },
  { label: 'Neachitat', value: 'pending' },
  { label: 'Achitat', value: 'paid' },
  { label: 'Restituit', value: 'refunded' },
  { label: 'Parțial restituit', value: 'partially_refunded' },
]

const FULFILLMENT_OPTIONS: { label: string; value: FulfillmentStatus | '' }[] = [
  { label: 'Toate expedierile', value: '' },
  { label: 'Neexpediat', value: 'unfulfilled' },
  { label: 'Parțial expediat', value: 'partially_fulfilled' },
  { label: 'Expediat', value: 'fulfilled' },
]

const PAGE_SIZE = 20

function getInitials(order: Order): string {
  const c = order.customer
  if (!c) return '?'
  const f = c.firstName?.[0] ?? ''
  const l = c.lastName?.[0] ?? ''
  if (f || l) return (f + l).toUpperCase()
  return c.email.slice(0, 2).toUpperCase()
}

function getCustomerLabel(order: Order): string {
  const c = order.customer
  if (!c) return 'Client necunoscut'
  const name = `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim()
  return name || c.email
}

function getProductsLabel(order: Order): string {
  if (order.items.length === 0) return '—'
  const first = order.items[0].title
  const rest = order.items.length - 1
  return rest > 0 ? `${first} +${rest}` : first
}

const filterCls =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-500 transition'

export function OrdersTable() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>()
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | undefined>()
  const [fulfillmentFilter, setFulfillmentFilter] = useState<FulfillmentStatus | undefined>()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useOrders({
    status: statusFilter,
    paymentStatus: paymentFilter,
    fulfillmentStatus: fulfillmentFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit: PAGE_SIZE,
  })

  const orders = data?.data ?? []

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) => {
      const name = getCustomerLabel(o).toLowerCase()
      return (
        String(o.orderNumber).includes(q) ||
        name.includes(q) ||
        (o.customer?.email ?? '').toLowerCase().includes(q)
      )
    })
  }, [orders, search])

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1
  const hasActiveFilters = paymentFilter ?? fulfillmentFilter ?? startDate ?? endDate

  const clearFilters = () => {
    setPaymentFilter(undefined)
    setFulfillmentFilter(undefined)
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  return (
    <div>
      {/* Status tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => { setStatusFilter(tab.value); setPage(1) }}
            className={[
              'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
              statusFilter === tab.value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-56">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Caută după nr., client, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 pl-9 pr-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <select
          value={paymentFilter ?? ''}
          onChange={(e) => { setPaymentFilter(e.target.value !== '' ? e.target.value as PaymentStatus : undefined); setPage(1) }}
          className={filterCls}
        >
          {PAYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select
          value={fulfillmentFilter ?? ''}
          onChange={(e) => { setFulfillmentFilter(e.target.value !== '' ? e.target.value as FulfillmentStatus : undefined); setPage(1) }}
          className={filterCls}
        >
          {FULFILLMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
          className={filterCls}
        />
        <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
          className={filterCls}
        />

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            Resetează
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nicio comandă găsită</p>
            {search && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Încearcă alte cuvinte cheie</p>}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 text-left">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 w-16">#</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Client</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Produse</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 text-right">Total</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 text-right">Dată</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/80">
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  onClick={() => navigate(`/orders/${orderSlug(order.orderNumber, order.createdAt)}`)}
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-semibold text-gray-400 dark:text-gray-500">
                      #{order.orderNumber}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          {getInitials(order)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-44">
                        {getCustomerLabel(order)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-gray-500 dark:text-gray-400 truncate max-w-56 block">
                      {getProductsLabel(order)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                      {formatMoney(order.total, order.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                      {formatRelativeDate(order.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!search && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Anterior</Button>
          <span className="text-xs text-gray-400 dark:text-gray-500">{page} / {totalPages}</span>
          <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Următor →</Button>
        </div>
      )}
    </div>
  )
}
