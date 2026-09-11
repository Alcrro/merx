import type { OrderStatus } from '@merx/types'
import { ORDER_STATUS_TABS } from '../../../lib/orders.constants'

interface OrdersStatusTabsProps {
  value: OrderStatus | undefined
  onChange: (value: OrderStatus | undefined) => void
}

function OrdersStatusTabs({ value, onChange }: OrdersStatusTabsProps) {
  return (
    <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 p-1 w-fit">
      {ORDER_STATUS_TABS.map((tab) => (
        <button
          key={tab.label}
          onClick={() => onChange(tab.value)}
          className={[
            'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
            value === tab.value
              ? 'bg-white dark:bg-gray-700 text-fg-primary shadow-sm'
              : 'text-fg-muted hover:text-fg-secondary',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default OrdersStatusTabs
