import type { FulfillmentStatus } from '@merx/types'
import { FULFILLMENT_STATUS_LABELS } from '../../../lib/orders.constants'

const STATUS_STYLES: Record<FulfillmentStatus, string> = {
  UNFULFILLED:       'badge-neutral',
  PROCESSING:        'badge-info',
  SHIPPED:           'badge-info',
  LOST_IN_TRANSIT:   'badge-warning',
  DELIVERED:         'badge-success',
  FULFILLED:         'badge-success',
  RETURN_IN_TRANSIT: 'badge-warning',
  RETURNED:          'badge-purple',
}

interface FulfillmentStatusBadgeProps {
  status: FulfillmentStatus
}

function FulfillmentStatusBadge({ status }: FulfillmentStatusBadgeProps) {
  return (
    <span className={STATUS_STYLES[status]}>
      {FULFILLMENT_STATUS_LABELS[status]}
    </span>
  )
}

export default FulfillmentStatusBadge
