import type { OrderStatus, PaymentStatus, FulfillmentStatus } from '@merx/types'
import { ORDER_STATUS_OPTIONS, PAYMENT_OPTIONS, FULFILLMENT_OPTIONS } from '../../../lib/orders.constants'
import { Select } from '../../atoms/Select'
import { Button } from '../../atoms/Button'

interface OrderStatusPanelProps {
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  isCancelled: boolean
  isUpdatingStatus: boolean
  isUpdatingPayment: boolean
  isUpdatingFulfillment: boolean
  isRefunding: boolean
  isCancelling: boolean
  onStatusChange: (v: OrderStatus) => void
  onPaymentChange: (v: PaymentStatus) => void
  onFulfillmentChange: (v: FulfillmentStatus) => void
  onRefund: () => void
  onCancel: () => void
}

function OrderStatusPanel({
  status,
  paymentStatus,
  fulfillmentStatus,
  isCancelled,
  isUpdatingStatus,
  isUpdatingPayment,
  isUpdatingFulfillment,
  isRefunding,
  isCancelling,
  onStatusChange,
  onPaymentChange,
  onFulfillmentChange,
  onRefund,
  onCancel,
}: OrderStatusPanelProps) {
  return (
    <div className="card p-6">
      <p className="section-label">Status</p>
      <div className="flex flex-col gap-3">
        <Select
          label="Comandă"
          value={status}
          options={ORDER_STATUS_OPTIONS}
          disabled={isCancelled || isUpdatingStatus}
          onChange={(v) => onStatusChange(v as OrderStatus)}
        />
        <Select
          label="Plată"
          value={paymentStatus}
          options={PAYMENT_OPTIONS}
          disabled={isCancelled || isUpdatingPayment}
          onChange={(v) => onPaymentChange(v as PaymentStatus)}
        />
        <Select
          label="Expediere"
          value={fulfillmentStatus}
          options={FULFILLMENT_OPTIONS}
          disabled={isCancelled || isUpdatingFulfillment}
          onChange={(v) => onFulfillmentChange(v as FulfillmentStatus)}
        />
      </div>

      {!isCancelled && (
        <div className="mt-5 pt-4 border-t border-border-subtle flex flex-col gap-2">
          {paymentStatus === 'PAID' && (
            <Button variant="ghost" isLoading={isRefunding} onClick={onRefund} className="w-full">
              Rambursare
            </Button>
          )}
          <Button variant="danger" isLoading={isCancelling} onClick={onCancel} className="w-full">
            Anulează comanda
          </Button>
        </div>
      )}
    </div>
  )
}

export default OrderStatusPanel
