import type { OrderStatus } from '@merx/types'
import { ORDER_STATUS_LABELS } from '../../../lib/orders.constants'

const STATUS_STYLES: Record<OrderStatus, string> = {
  DRAFT:     'badge-neutral',
  ACTIVE:    'badge-info',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
}

interface OrderStatusBadgeProps {
  status: OrderStatus
}

function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span className={STATUS_STYLES[status]}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}

export default OrderStatusBadge
