import type { OrderItem } from '@merx/types'
import { formatMoney } from '../../../lib/format'

interface OrderItemsCardProps {
  items: OrderItem[]
  currency: string
}

function OrderItemsCard({ items, currency }: OrderItemsCardProps) {
  return (
    <div className="card p-6">
      <p className="section-label">Produse ({items.length})</p>
      <div className="divide-y divide-border-subtle">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-9 w-9 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="h-4 w-4 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-fg-primary">{item.title}</p>
                {item.sku && (
                  <p className="mt-0.5 text-xs font-mono text-fg-muted">{item.sku}</p>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-sm text-fg-secondary">
                {item.quantity} × {formatMoney(item.unitPrice, currency)}
              </p>
              <p className="mt-0.5 font-semibold text-fg-primary">
                {formatMoney(item.total, currency)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderItemsCard
