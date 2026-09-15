import { useState } from 'react'
import type { StoreInventoryItem } from '@merx/types'
import { useSetStoreVariantStatus } from '../../../hooks/useInventory'
import { Button } from '../../atoms/Button'
import type { InventoryMode } from '../../../pages/inventory/InventoryPage'
import { StockUpdateModal } from '../../molecules/inventory/StockUpdateModal'

interface Props {
  items: StoreInventoryItem[]
  isLoading: boolean
  mode: InventoryMode
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const MOVEMENT_LABELS: Record<'in' | 'out' | 'adjustment', { label: string; className: string }> = {
  in:         { label: 'Recepție',  className: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' },
  out:        { label: 'Eliminare', className: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' },
  adjustment: { label: 'Corecție',  className: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
}

function MovementBadge({ type }: { type: 'in' | 'out' | 'adjustment' | null }) {
  if (!type) return <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
  const { label, className } = MOVEMENT_LABELS[type]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

function StatusToggle({ item }: { item: StoreInventoryItem }) {
  const { mutate, isPending } = useSetStoreVariantStatus(item.storeProductVariantId)
  return (
    <button
      disabled={isPending}
      onClick={() => mutate(!item.isActive)}
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50',
        item.isActive
          ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
      ].join(' ')}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
      {item.isActive ? 'Activ' : 'Inactiv'}
    </button>
  )
}

export function StoreInventoryTable({ items, isLoading, mode, page, totalPages, onPageChange }: Props) {
  const showStatus = mode === 'default' || mode === 'both'
  const showQty = mode === 'physical' || mode === 'both'
  const [modalItem, setModalItem] = useState<StoreInventoryItem | null>(null)

  return (
    <>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Niciun produs în inventar</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Adaugă produse din secțiunea Produse</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 text-left">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Produs</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Variantă</th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">SKU</th>
                {showQty && (
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Ultimul update
                  </th>
                )}
                {showQty && (
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 text-right">
                    Cantitate
                  </th>
                )}
                {showStatus && (
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 text-right">
                    Status
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/80">
              {items.map((item) => (
                <tr key={item.storeProductVariantId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">{item.productTitle}</td>
                  <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{item.variantTitle}</td>
                  <td className="px-4 py-4 font-mono text-xs text-gray-400 dark:text-gray-500">{item.sku}</td>
                  {showQty && (
                    <td className="px-4 py-4">
                      <MovementBadge type={item.lastMovementType} />
                    </td>
                  )}
                  {showQty && (
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setModalItem(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium tabular-nums text-gray-800 dark:text-gray-200 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                      >
                        {item.quantity}
                        <svg className="h-3 w-3 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                        </svg>
                      </button>
                    </td>
                  )}
                  {showStatus && (
                    <td className="px-5 py-4 text-right">
                      <StatusToggle item={item} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="ghost" disabled={page === 1} onClick={() => onPageChange(page - 1)}>← Anterior</Button>
          <span className="text-xs text-gray-400 dark:text-gray-500">{page} / {totalPages}</span>
          <Button variant="ghost" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>Următor →</Button>
        </div>
      )}

      {modalItem && (
        <StockUpdateModal item={modalItem} onClose={() => setModalItem(null)} />
      )}
    </>
  )
}
