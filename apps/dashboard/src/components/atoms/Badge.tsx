import type { ProductStatus } from '@merx/types'

const STATUS_STYLES: Record<ProductStatus, string> = {
  active: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
  draft: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  archived: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
}

const STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'Activ',
  draft: 'Draft',
  archived: 'Arhivat',
}

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
