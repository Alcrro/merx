import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { OrderStatus, PaymentStatus, FulfillmentStatus } from '@merx/types'
import { useOrders } from '../../../hooks/useOrders'
import { Button } from '../../atoms/Button'
import { OrderStatusBadge } from '../../molecules/orders/OrderStatusBadge'
import { PaymentStatusBadge } from '../../molecules/orders/PaymentStatusBadge'
import { FulfillmentStatusBadge } from '../../molecules/orders/FulfillmentStatusBadge'

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

const filterSelectCls =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-500'

const dateInputCls =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-500'

export function OrdersTable() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>()
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | undefined>()
  const [fulfillmentFilter, setFulfillmentFilter] = useState<FulfillmentStatus | undefined>()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
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

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1
  const hasActiveFilters = (paymentFilter ?? fulfillmentFilter ?? startDate) || endDate

  const clearFilters = () => {
    setPaymentFilter(undefined)
    setFulfillmentFilter(undefined)
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  return (
    <div>
      <div className="mb-3 flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => { setStatusFilter(tab.value); setPage(1) }}
            className={[
              'rounded-md px-3 py-1.5 text-sm transition',
              statusFilter === tab.value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={paymentFilter ?? ''}
          onChange={(e) => { setPaymentFilter(e.target.value !== '' ? e.target.value as PaymentStatus : undefined); setPage(1) }}
          className={filterSelectCls}
        >
          {PAYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select
          value={fulfillmentFilter ?? ''}
          onChange={(e) => { setFulfillmentFilter(e.target.value !== '' ? e.target.value as FulfillmentStatus : undefined); setPage(1) }}
          className={filterSelectCls}
        >
          {FULFILLMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
          className={dateInputCls}
        />
        <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
          className={dateInputCls}
        />

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-sm text-indigo-600 hover:underline">
            Resetează filtrele
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400 dark:text-gray-500">Se încarcă...</div>
        ) : !data?.data.length ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-500 dark:text-gray-400">
            Nicio comandă găsită.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">#</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Client</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Produse</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Plată</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Expediere</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Total</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Dată</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {data.data.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">#{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {order.customer
                      ? `${order.customer.firstName ?? ''} ${order.customer.lastName ?? ''}`.trim() || order.customer.email
                      : <span className="text-gray-400 dark:text-gray-500">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{order.items.length}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3"><PaymentStatusBadge status={order.paymentStatus} /></td>
                  <td className="px-4 py-3"><FulfillmentStatusBadge status={order.fulfillmentStatus} /></td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                    {order.total.toFixed(2)} {order.currency}
                  </td>
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('ro-RO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Anterior</Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">{page} / {totalPages}</span>
          <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Următor →</Button>
        </div>
      )}
    </div>
  )
}
