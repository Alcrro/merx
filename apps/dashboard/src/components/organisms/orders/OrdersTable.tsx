import { useState, useMemo } from 'react'
import type { OrderStatus, PaymentStatus, FulfillmentStatus } from '@merx/types'
import { useOrders } from '../../../hooks/useOrders'
import { getOrderCustomerLabel } from '../../../lib/orders'
import { Button } from '../../atoms/Button'
import { Spinner } from '../../atoms/Spinner'
import EmptyState from '../../atoms/EmptyState'
import OrdersStatusTabs from '../../molecules/orders/OrdersStatusTabs'
import OrdersFilters from '../../molecules/orders/OrdersFilters'
import OrdersTableBody from '../../molecules/orders/OrdersTableBody'

const PAGE_SIZE = 20

function OrdersTable() {
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

  const filtered = useMemo(() => {
    const orders = data?.data ?? []
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) => {
      const name = getOrderCustomerLabel(o).toLowerCase()
      return (
        String(o.orderNumber).includes(q) ||
        name.includes(q) ||
        (o.customer?.email ?? '').toLowerCase().includes(q)
      )
    })
  }, [data, search])

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1
  const hasActiveFilters = paymentFilter !== undefined || fulfillmentFilter !== undefined || startDate !== '' || endDate !== ''

  const clearFilters = () => {
    setPaymentFilter(undefined)
    setFulfillmentFilter(undefined)
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  return (
    <div>
      <OrdersStatusTabs
        value={statusFilter}
        onChange={(v) => { setStatusFilter(v); setPage(1) }}
      />
      <OrdersFilters
        search={search}
        paymentFilter={paymentFilter}
        fulfillmentFilter={fulfillmentFilter}
        startDate={startDate}
        endDate={endDate}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearch}
        onPaymentChange={(v) => { setPaymentFilter(v); setPage(1) }}
        onFulfillmentChange={(v) => { setFulfillmentFilter(v); setPage(1) }}
        onStartDateChange={(v) => { setStartDate(v); setPage(1) }}
        onEndDateChange={(v) => { setEndDate(v); setPage(1) }}
        onClearFilters={clearFilters}
      />

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="h-5 w-5" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            message="Nicio comandă găsită"
            hint={search ? 'Încearcă alte cuvinte cheie' : undefined}
          />
        ) : (
          <OrdersTableBody orders={filtered} />
        )}
      </div>

      {!search && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Anterior</Button>
          <span className="text-xs text-fg-muted">{page} / {totalPages}</span>
          <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Următor →</Button>
        </div>
      )}
    </div>
  )
}

export default OrdersTable
