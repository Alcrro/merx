import type { ListingStatus } from '@merx/api-client'

const STYLES: Record<ListingStatus, string> = {
  active: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
  draft: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  sold: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
  expired: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-500',
  removed: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
}

const LABELS: Record<ListingStatus, string> = {
  active: 'Activ',
  draft: 'Draft',
  sold: 'Vândut',
  expired: 'Expirat',
  removed: 'Șters',
}

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  )
}
