import type { InventoryItem } from '@merx/types'
import { Button } from '../../atoms/Button'
import { StockBadge } from '../../atoms/StockBadge'
import { ReorderInput } from '../../molecules/inventory/ReorderInput'
import { InventoryAdjustPanel } from '../../molecules/inventory/InventoryAdjustPanel'
import { stockStatus } from '../../../lib/inventory.constants'

interface Props {
  items: InventoryItem[]
  isLoading: boolean
  lowStockOnly: boolean
  adjustingId: string | null
  onAdjust: (id: string | null) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function InventoryTable({ items, isLoading, lowStockOnly, adjustingId, onAdjust, page, totalPages, onPageChange }: Props) {
  const adjustingItem = adjustingId ? (items.find((i) => i.variantId === adjustingId) ?? null) : null

  return (
    <>
      {adjustingItem && (
        <div className="mb-5">
          <InventoryAdjustPanel item={adjustingItem} onClose={() => onAdjust(null)} />
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400 dark:text-gray-500">Se încarcă...</div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-500 dark:text-gray-400">
            {lowStockOnly ? 'Niciun produs cu stoc scăzut.' : 'Niciun produs în inventar.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Produs / Variantă</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">SKU</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Total</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Rezervat</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Disponibil</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Reorder</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {items.map((item) => {
                const isAdjusting = adjustingId === item.variantId
                return (
                  <tr key={item.id} className={isAdjusting ? 'bg-indigo-50 dark:bg-indigo-950' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{item.variant.productTitle}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{item.variant.title}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{item.variant.sku}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">{item.quantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-orange-600 dark:text-orange-400">{item.reservedQuantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-900 dark:text-gray-100">{item.availableQuantity}</td>
                    <td className="px-4 py-3 text-right"><ReorderInput item={item} /></td>
                    <td className="px-4 py-3"><StockBadge status={stockStatus(item)} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" onClick={() => onAdjust(isAdjusting ? null : item.variantId)}>
                        {isAdjusting ? 'Închide' : 'Ajustează'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="ghost" disabled={page === 1} onClick={() => onPageChange(page - 1)}>← Anterior</Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">{page} / {totalPages}</span>
          <Button variant="ghost" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>Următor →</Button>
        </div>
      )}
    </>
  )
}
