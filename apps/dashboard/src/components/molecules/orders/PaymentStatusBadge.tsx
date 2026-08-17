import type { PaymentStatus } from '@merx/types'

const STYLES: Record<PaymentStatus, string> = {
  pending: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  paid: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
  refunded: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400',
  partially_refunded: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400',
}

const LABELS: Record<PaymentStatus, string> = {
  pending: 'Neachitat',
  paid: 'Achitat',
  refunded: 'Restituit',
  partially_refunded: 'Parțial restituit',
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  )
}

export { LABELS as PAYMENT_STATUS_LABELS }
