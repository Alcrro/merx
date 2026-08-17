import { STOCK_BADGE } from '../../lib/inventory.constants'
import type { StockStatus } from '../../lib/inventory.constants'

export function StockBadge({ status }: { status: StockStatus }) {
  const { label, style } = STOCK_BADGE[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}
