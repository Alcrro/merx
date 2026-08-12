import type { OrderStatus } from '@merx/types'

const STYLES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400',
  confirmed: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
  completed: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
  cancelled: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
}

const LABELS: Record<OrderStatus, string> = {
  pending: 'În așteptare',
  confirmed: 'Confirmat',
  completed: 'Finalizat',
  cancelled: 'Anulat',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  )
}

export { LABELS as ORDER_STATUS_LABELS }
