import type { PaymentStatus, FulfillmentStatus } from '@merx/types'
import { PAYMENT_FILTER_OPTIONS, FULFILLMENT_FILTER_OPTIONS } from '../../../lib/orders.constants'
import { Button } from '../../atoms/Button'

interface OrdersFiltersProps {
  search: string
  paymentFilter: PaymentStatus | undefined
  fulfillmentFilter: FulfillmentStatus | undefined
  startDate: string
  endDate: string
  hasActiveFilters: boolean
  onSearchChange: (v: string) => void
  onPaymentChange: (v: PaymentStatus | undefined) => void
  onFulfillmentChange: (v: FulfillmentStatus | undefined) => void
  onStartDateChange: (v: string) => void
  onEndDateChange: (v: string) => void
  onClearFilters: () => void
}

function OrdersFilters({
  search,
  paymentFilter,
  fulfillmentFilter,
  startDate,
  endDate,
  hasActiveFilters,
  onSearchChange,
  onPaymentChange,
  onFulfillmentChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
}: OrdersFiltersProps) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-56">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          placeholder="Caută după nr., client, email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full input-compact pl-9"
        />
      </div>

      <select
        value={paymentFilter ?? ''}
        onChange={(e) => onPaymentChange(e.target.value !== '' ? e.target.value as PaymentStatus : undefined)}
        className="input-compact"
      >
        {PAYMENT_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select
        value={fulfillmentFilter ?? ''}
        onChange={(e) => onFulfillmentChange(e.target.value !== '' ? e.target.value as FulfillmentStatus : undefined)}
        className="input-compact"
      >
        {FULFILLMENT_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="input-compact"
      />
      <span className="text-sm text-fg-muted">—</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="input-compact"
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Resetează
        </Button>
      )}
    </div>
  )
}

export default OrdersFilters
