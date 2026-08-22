import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '@merx/types'
import {
  useOrder,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
  useUpdateFulfillmentStatus,
  useCancelOrder,
  useRefundOrder,
} from '../../../hooks/useOrders'
import { formatMoney } from '../../../lib/format'
import { Select } from '../../atoms/Select'
import { Button } from '../../atoms/Button'
import { OrderStatusBadge } from '../../molecules/orders/OrderStatusBadge'

const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'În așteptare' },
  { value: 'confirmed', label: 'Confirmat' },
  { value: 'completed', label: 'Finalizat' },
  { value: 'cancelled', label: 'Anulat' },
]

const PAYMENT_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'pending', label: 'Neachitat' },
  { value: 'paid', label: 'Achitat' },
  { value: 'refunded', label: 'Restituit' },
  { value: 'partially_refunded', label: 'Parțial restituit' },
]

const FULFILLMENT_OPTIONS: { value: FulfillmentStatus; label: string }[] = [
  { value: 'unfulfilled', label: 'Neexpediat' },
  { value: 'partially_fulfilled', label: 'Parțial expediat' },
  { value: 'fulfilled', label: 'Expediat' },
]

interface Props {
  orderSlug: string
  onBack: () => void
}

function getInitials(order: Order): string {
  const c = order.customer
  if (!c) return '?'
  const f = c.firstName?.[0] ?? ''
  const l = c.lastName?.[0] ?? ''
  if (f || l) return (f + l).toUpperCase()
  return c.email.slice(0, 2).toUpperCase()
}

function getShippingLines(addr: Record<string, unknown>): string[] {
  const lines: string[] = []
  const street = (addr.street ?? addr.address ?? addr.line1 ?? addr.streetAddress) as string | undefined
  const city = addr.city as string | undefined
  const zip = (addr.postalCode ?? addr.zip ?? addr.postal_code) as string | undefined
  const country = addr.country as string | undefined
  if (street) lines.push(street)
  if (city && zip) lines.push(`${city}, ${zip}`)
  else if (city) lines.push(city)
  else if (zip) lines.push(zip)
  if (country) lines.push(country)
  return lines
}

const cardCls = 'rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6'
const sectionTitle = 'text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-4'

function RefundModal({
  order,
  onClose,
  onConfirm,
  isLoading,
}: {
  order: Order
  onClose: () => void
  onConfirm: (amount?: number) => void
  isLoading: boolean
}) {
  const [type, setType] = useState<'full' | 'partial'>('full')
  const [rawAmount, setRawAmount] = useState('')
  const [error, setError] = useState('')

  const partialAmount = parseFloat(rawAmount)
  const isValidPartial = !isNaN(partialAmount) && partialAmount > 0 && partialAmount <= order.total

  const handleConfirm = () => {
    if (type === 'partial') {
      if (!isValidPartial) {
        setError(`Suma trebuie să fie între 0.01 și ${order.total} ${order.currency}`)
        return
      }
      onConfirm(partialAmount)
    } else {
      onConfirm(undefined)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Rambursare comandă #{order.orderNumber}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Total comandă: <span className="font-medium text-gray-700 dark:text-gray-300">{formatMoney(order.total, order.currency)}</span>
        </p>

        <div className="space-y-3 mb-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              checked={type === 'full'}
              onChange={() => { setType('full'); setError('') }}
              className="h-4 w-4 text-indigo-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Rambursare totală</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{formatMoney(order.total, order.currency)} returnat clientului</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              checked={type === 'partial'}
              onChange={() => { setType('partial'); setError('') }}
              className="h-4 w-4 text-indigo-600"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Rambursare parțială</p>
              {type === 'partial' && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0.01"
                      max={order.total}
                      step="0.01"
                      value={rawAmount}
                      onChange={(e) => { setRawAmount(e.target.value); setError('') }}
                      placeholder={`Max ${order.total}`}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                    <span className="text-sm text-gray-400 dark:text-gray-500 shrink-0">{order.currency}</span>
                  </div>
                  {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                </div>
              )}
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>Anulează</Button>
          <Button onClick={handleConfirm} isLoading={isLoading}>
            Confirmă rambursarea
          </Button>
        </div>
      </div>
    </div>
  )
}

export function OrderDetail({ orderSlug, onBack }: Props) {
  const { data: order, isLoading } = useOrder(orderSlug)
  const orderId = order?.id ?? ''
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus(orderId)
  const { mutate: updatePayment, isPending: isUpdatingPayment } = useUpdatePaymentStatus(orderId)
  const { mutate: updateFulfillment, isPending: isUpdatingFulfillment } = useUpdateFulfillmentStatus(orderId)
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder(orderId)
  const { mutate: refundOrder, isPending: isRefunding } = useRefundOrder(orderId)
  const [showRefund, setShowRefund] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (!order) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Comanda nu a fost găsită.</div>
  }

  const isCancelled = order.status === 'cancelled'
  const customerName = order.customer
    ? `${order.customer.firstName ?? ''} ${order.customer.lastName ?? ''}`.trim() || order.customer.email
    : null
  const shippingLines = order.shippingAddress ? getShippingLines(order.shippingAddress) : []
  const orderDate = new Date(order.createdAt).toLocaleDateString('ro-RO', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Comenzi
          </button>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Comanda #{order.orderNumber}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{orderDate}</p>
          </div>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — products + summary */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Products */}
          <div className={cardCls}>
            <p className={sectionTitle}>Produse ({order.items.length})</p>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-9 w-9 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{item.title}</p>
                      {item.sku && (
                        <p className="mt-0.5 text-xs font-mono text-gray-400 dark:text-gray-500">{item.sku}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.quantity} × {formatMoney(item.unitPrice, order.currency)}
                    </p>
                    <p className="mt-0.5 font-semibold text-gray-900 dark:text-gray-100">
                      {formatMoney(item.total, order.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className={cardCls}>
            <p className={sectionTitle}>Sumar</p>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatMoney(order.subtotal, order.currency)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount</span>
                  <span className="tabular-nums">−{formatMoney(order.discountTotal, order.currency)}</span>
                </div>
              )}
              {order.shippingTotal > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Transport</span>
                  <span className="tabular-nums">{formatMoney(order.shippingTotal, order.currency)}</span>
                </div>
              )}
              {order.taxTotal > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>TVA</span>
                  <span className="tabular-nums">{formatMoney(order.taxTotal, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-3 font-semibold text-gray-900 dark:text-gray-100">
                <span>Total</span>
                <span className="tabular-nums">{formatMoney(order.total, order.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — client, address, status */}
        <div className="flex flex-col gap-5">
          {/* Client */}
          {order.customer && (
            <div className={cardCls}>
              <p className={sectionTitle}>Client</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {getInitials(order)}
                  </span>
                </div>
                <div className="min-w-0">
                  {customerName && (
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{customerName}</p>
                  )}
                  <Link
                    to={`/customers/${order.customer.id}`}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline truncate block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {order.customer.email}
                  </Link>
                </div>
              </div>
              <Link
                to={`/customers/${order.customer.id}`}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Vezi profil client
              </Link>
            </div>
          )}

          {/* Shipping address */}
          {shippingLines.length > 0 && (
            <div className={cardCls}>
              <p className={sectionTitle}>Adresă livrare</p>
              <div className="flex flex-col gap-1">
                {shippingLines.map((line, i) => (
                  <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Status controls */}
          <div className={cardCls}>
            <p className={sectionTitle}>Status</p>
            <div className="flex flex-col gap-3">
              <Select
                label="Comandă"
                value={order.status}
                options={ORDER_STATUS_OPTIONS}
                disabled={isCancelled || isUpdatingStatus}
                onChange={(e) => updateStatus(e.target.value as OrderStatus)}
              />
              <Select
                label="Plată"
                value={order.paymentStatus}
                options={PAYMENT_OPTIONS}
                disabled={isCancelled || isUpdatingPayment}
                onChange={(e) => updatePayment(e.target.value as PaymentStatus)}
              />
              <Select
                label="Expediere"
                value={order.fulfillmentStatus}
                options={FULFILLMENT_OPTIONS}
                disabled={isCancelled || isUpdatingFulfillment}
                onChange={(e) => updateFulfillment(e.target.value as FulfillmentStatus)}
              />
            </div>

            {!isCancelled && (
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
                {order.paymentStatus === 'paid' && (
                  <Button
                    variant="ghost"
                    isLoading={isRefunding}
                    onClick={() => setShowRefund(true)}
                    className="w-full"
                  >
                    Rambursare
                  </Button>
                )}
                <Button
                  variant="danger"
                  isLoading={isCancelling}
                  onClick={() => cancelOrder()}
                  className="w-full"
                >
                  Anulează comanda
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRefund && (
        <RefundModal
          order={order}
          onClose={() => setShowRefund(false)}
          onConfirm={(amount) => {
            refundOrder(amount, { onSuccess: () => setShowRefund(false) })
          }}
          isLoading={isRefunding}
        />
      )}
    </div>
  )
}
