import { STOCK_BADGE } from '../../lib/inventory.constants'
import type { StockStatus } from '../../lib/inventory.constants'

export function StockBadge({ status }: { status: StockStatus }) {
  const { label, style } = STOCK_BADGE[status]
  return <span className={style}>{label}</span>
}
