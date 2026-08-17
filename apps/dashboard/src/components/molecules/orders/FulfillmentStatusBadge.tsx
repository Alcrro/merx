import type { FulfillmentStatus } from '@merx/types'

const STYLES: Record<FulfillmentStatus, string> = {
  unfulfilled: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  partially_fulfilled: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
  fulfilled: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
}

const LABELS: Record<FulfillmentStatus, string> = {
  unfulfilled: 'Neexpediat',
  partially_fulfilled: 'Parțial expediat',
  fulfilled: 'Expediat',
}

export function FulfillmentStatusBadge({ status }: { status: FulfillmentStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  )
}

export { LABELS as FULFILLMENT_STATUS_LABELS }
