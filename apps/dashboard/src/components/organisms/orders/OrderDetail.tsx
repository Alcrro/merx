import { useState } from 'react'
import {
  useOrder,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
  useUpdateFulfillmentStatus,
  useCancelOrder,
  useRefundOrder,
} from '../../../hooks/useOrders'
import { getOrderInitials, getOrderCustomerName, getOrderShippingLines, formatOrderDate, isOrderCancelled } from '../../../lib/orders'
import { Spinner } from '../../atoms/Spinner'
import { Button } from '../../atoms/Button'
import EmptyState from '../../atoms/EmptyState'
import OrderStatusBadge from '../../molecules/orders/OrderStatusBadge'
import OrderItemsCard from '../../molecules/orders/OrderItemsCard'
import OrderSummaryCard from '../../molecules/orders/OrderSummaryCard'
import OrderCustomerCard from '../../molecules/orders/OrderCustomerCard'
import OrderShippingCard from '../../molecules/orders/OrderShippingCard'
import OrderStatusPanel from '../../molecules/orders/OrderStatusPanel'
import RefundModal from '../../molecules/orders/RefundModal'

interface OrderDetailProps {
  orderSlug: string
  onBack: () => void
}

function OrderDetail({ orderSlug, onBack }: OrderDetailProps) {
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
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  if (!order) {
    return <EmptyState message="Comanda nu a fost găsită." />
  }

  const isCancelled = isOrderCancelled(order)
  const customerName = getOrderCustomerName(order)
  const shippingLines = getOrderShippingLines(order)
  const orderDate = formatOrderDate(order)

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Comenzi
          </Button>
          <span className="text-fg-muted">/</span>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-semibold text-fg-primary">
                Comanda #{order.orderNumber}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-0.5 text-xs text-fg-muted">{orderDate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <OrderItemsCard items={order.items} currency={order.currency} />
          <OrderSummaryCard
            subtotal={order.subtotal}
            discountTotal={order.discountTotal}
            shippingTotal={order.shippingTotal}
            taxTotal={order.taxTotal}
            total={order.total}
            currency={order.currency}
          />
        </div>

        <div className="flex flex-col gap-5">
          {order.customer && (
            <OrderCustomerCard
              customer={order.customer}
              initials={getOrderInitials(order)}
              customerName={customerName}
            />
          )}
          {shippingLines.length > 0 && (
            <OrderShippingCard shippingLines={shippingLines} />
          )}
          <OrderStatusPanel
            status={order.status}
            paymentStatus={order.paymentStatus}
            fulfillmentStatus={order.fulfillmentStatus}
            isCancelled={isCancelled}
            isUpdatingStatus={isUpdatingStatus}
            isUpdatingPayment={isUpdatingPayment}
            isUpdatingFulfillment={isUpdatingFulfillment}
            isRefunding={isRefunding}
            isCancelling={isCancelling}
            onStatusChange={(v) => updateStatus(v)}
            onPaymentChange={(v) => updatePayment(v)}
            onFulfillmentChange={(v) => updateFulfillment(v)}
            onRefund={() => setShowRefund(true)}
            onCancel={() => cancelOrder()}
          />
        </div>
      </div>

      {showRefund && (
        <RefundModal
          order={order}
          onClose={() => setShowRefund(false)}
          onConfirm={(amount) => refundOrder(amount, { onSuccess: () => setShowRefund(false) })}
          isLoading={isRefunding}
        />
      )}
    </div>
  )
}

export default OrderDetail
