import type { ProductStatus } from '@merx/types'

const STATUS_STYLES: Record<ProductStatus, string> = {
  active:   'badge-success',
  draft:    'badge-neutral',
  archived: 'badge-danger',
}

const STATUS_LABELS: Record<ProductStatus, string> = {
  active:   'Activ',
  draft:    'Draft',
  archived: 'Arhivat',
}

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span className={STATUS_STYLES[status]}>
      {STATUS_LABELS[status]}
    </span>
  )
}
