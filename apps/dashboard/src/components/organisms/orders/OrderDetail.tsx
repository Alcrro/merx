import { Link } from 'react-router-dom'
import type { OrderStatus, PaymentStatus, FulfillmentStatus } from '@merx/types'
import {
  useOrder,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
  useUpdateFulfillmentStatus,
  useCancelOrder,
} from '../../../hooks/useOrders'
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
  orderId: string
  onBack: () => void
}

export function OrderDetail({ orderId, onBack }: Props) {
  const { data: order, isLoading } = useOrder(orderId)
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus(orderId)
  const { mutate: updatePayment, isPending: isUpdatingPayment } = useUpdatePaymentStatus(orderId)
  const { mutate: updateFulfillment, isPending: isUpdatingFulfillment } = useUpdateFulfillmentStatus(orderId)
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder(orderId)

  if (isLoading) {
    return <div className="flex items-center justify-center py-32 text-sm text-gray-400 dark:text-gray-500">Se încarcă...</div>
  }

  if (!order) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Comanda nu a fost găsită.</div>
  }

  const isCancelled = order.status === 'cancelled'
  const customerName = order.customer
    ? `${order.customer.firstName ?? ''} ${order.customer.lastName ?? ''}`.trim() || order.customer.email
    : null

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">
          ← Înapoi
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Comanda #{order.orderNumber}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status comandă</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="Status"
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
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                isLoading={isCancelling}
                onClick={() => cancelOrder()}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Anulează comanda
              </Button>
            </div>
          )}
        </div>

        {order.customer && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Client</h2>
            {customerName && <p className="text-sm text-gray-800 dark:text-gray-200">{customerName}</p>}
            <Link
              to={`/customers/${order.customer.id}`}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {order.customer.email}
            </Link>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Produse ({order.items.length})</h2>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.title}</p>
                  {item.sku && <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{item.sku}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {item.quantity} × {item.unitPrice.toFixed(2)} {order.currency}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {item.total.toFixed(2)} {order.currency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Sumar</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>{order.subtotal.toFixed(2)} {order.currency}</span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount</span>
                <span>−{order.discountTotal.toFixed(2)} {order.currency}</span>
              </div>
            )}
            {order.shippingTotal > 0 && (
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Transport</span>
                <span>{order.shippingTotal.toFixed(2)} {order.currency}</span>
              </div>
            )}
            {order.taxTotal > 0 && (
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>TVA</span>
                <span>{order.taxTotal.toFixed(2)} {order.currency}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-2 font-semibold text-gray-900 dark:text-gray-100">
              <span>Total</span>
              <span>{order.total.toFixed(2)} {order.currency}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
