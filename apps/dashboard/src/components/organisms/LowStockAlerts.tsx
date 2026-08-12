import { Link } from 'react-router-dom'
import type { InventoryItem } from '@merx/types'

interface Props {
  items?: InventoryItem[]
  isLoading: boolean
}

export function LowStockAlerts({ items, isLoading }: Props) {
  const alerts = (items ?? []).filter((i) => i.availableQuantity <= i.reorderPoint).slice(0, 8)

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Stoc scăzut</p>
        <Link to="/inventory" className="text-xs text-indigo-600 hover:underline">
          Vezi inventar
        </Link>
      </div>
      {isLoading ? (
        <div className="h-48 animate-pulse bg-gray-50 dark:bg-gray-800" />
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-1">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Stoc OK</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Niciun produs sub reorder point.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {alerts.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.variant.productTitle}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{item.variant.title}</p>
              </div>
              <div className="ml-3 text-right shrink-0">
                <p className={`text-sm font-bold tabular-nums ${item.availableQuantity <= 0 ? 'text-red-500 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {item.availableQuantity}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">/ {item.reorderPoint}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
