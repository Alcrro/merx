import type { PaymentStatus } from '@merx/types'
import { PAYMENT_STATUS_LABELS } from '../../../lib/orders.constants'

const STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING:            'badge-neutral',
  AUTHORIZED:         'badge-info',
  PAID:               'badge-success',
  PAYMENT_FAILED:     'badge-danger',
  VOID:               'badge-neutral',
  REFUND_PENDING:     'badge-warning',
  PARTIALLY_REFUNDED: 'badge-warning',
  REFUNDED:           'badge-purple',
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus
}

function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span className={STATUS_STYLES[status]}>
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  )
}

export default PaymentStatusBadge
