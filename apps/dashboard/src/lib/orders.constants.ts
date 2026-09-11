import type { OrderStatus, PaymentStatus, FulfillmentStatus } from '@merx/types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT:     'Ciornă',
  ACTIVE:    'Activă',
  COMPLETED: 'Finalizată',
  CANCELLED: 'Anulată',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING:            'Neachitat',
  AUTHORIZED:         'Autorizat',
  PAID:               'Achitat',
  PAYMENT_FAILED:     'Plată eșuată',
  VOID:               'Anulat',
  REFUND_PENDING:     'Rambursare în curs',
  PARTIALLY_REFUNDED: 'Parțial rambursat',
  REFUNDED:           'Rambursat',
}

export const FULFILLMENT_STATUS_LABELS: Record<FulfillmentStatus, string> = {
  UNFULFILLED:       'Neexpediat',
  PROCESSING:        'În procesare',
  SHIPPED:           'Expediat',
  LOST_IN_TRANSIT:   'Pierdut în tranzit',
  DELIVERED:         'Livrat',
  FULFILLED:         'Finalizat',
  RETURN_IN_TRANSIT: 'Retur în tranzit',
  RETURNED:          'Returnat',
}

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'DRAFT',     label: 'Ciornă' },
  { value: 'ACTIVE',    label: 'Activă' },
  { value: 'COMPLETED', label: 'Finalizată' },
  { value: 'CANCELLED', label: 'Anulată' },
]

export const PAYMENT_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'PENDING',            label: 'Neachitat' },
  { value: 'AUTHORIZED',         label: 'Autorizat' },
  { value: 'PAID',               label: 'Achitat' },
  { value: 'PAYMENT_FAILED',     label: 'Plată eșuată' },
  { value: 'VOID',               label: 'Anulat' },
  { value: 'REFUND_PENDING',     label: 'Rambursare în curs' },
  { value: 'PARTIALLY_REFUNDED', label: 'Parțial rambursat' },
  { value: 'REFUNDED',           label: 'Rambursat' },
]

export const FULFILLMENT_OPTIONS: { value: FulfillmentStatus; label: string }[] = [
  { value: 'UNFULFILLED',       label: 'Neexpediat' },
  { value: 'PROCESSING',        label: 'În procesare' },
  { value: 'SHIPPED',           label: 'Expediat' },
  { value: 'LOST_IN_TRANSIT',   label: 'Pierdut în tranzit' },
  { value: 'DELIVERED',         label: 'Livrat' },
  { value: 'FULFILLED',         label: 'Finalizat' },
  { value: 'RETURN_IN_TRANSIT', label: 'Retur în tranzit' },
  { value: 'RETURNED',          label: 'Returnat' },
]

export const ORDER_STATUS_TABS: { label: string; value: OrderStatus | undefined }[] = [
  { label: 'Toate',      value: undefined },
  { label: 'Ciorne',     value: 'DRAFT' },
  { label: 'Active',     value: 'ACTIVE' },
  { label: 'Finalizate', value: 'COMPLETED' },
  { label: 'Anulate',    value: 'CANCELLED' },
]

export const PAYMENT_FILTER_OPTIONS: { label: string; value: PaymentStatus | '' }[] = [
  { label: 'Toate plățile',       value: '' },
  { label: 'Neachitat',           value: 'PENDING' },
  { label: 'Autorizat',           value: 'AUTHORIZED' },
  { label: 'Achitat',             value: 'PAID' },
  { label: 'Plată eșuată',        value: 'PAYMENT_FAILED' },
  { label: 'Anulat',              value: 'VOID' },
  { label: 'Rambursare în curs',  value: 'REFUND_PENDING' },
  { label: 'Parțial rambursat',   value: 'PARTIALLY_REFUNDED' },
  { label: 'Rambursat',           value: 'REFUNDED' },
]

export const FULFILLMENT_FILTER_OPTIONS: { label: string; value: FulfillmentStatus | '' }[] = [
  { label: 'Toate expedierile',   value: '' },
  { label: 'Neexpediat',          value: 'UNFULFILLED' },
  { label: 'În procesare',        value: 'PROCESSING' },
  { label: 'Expediat',            value: 'SHIPPED' },
  { label: 'Pierdut în tranzit',  value: 'LOST_IN_TRANSIT' },
  { label: 'Livrat',              value: 'DELIVERED' },
  { label: 'Finalizat',           value: 'FULFILLED' },
  { label: 'Retur în tranzit',    value: 'RETURN_IN_TRANSIT' },
  { label: 'Returnat',            value: 'RETURNED' },
]
