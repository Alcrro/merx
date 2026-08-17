import type { InventoryItem } from '@merx/types'

export type StockStatus = 'ok' | 'low' | 'out'

export function stockStatus(item: InventoryItem): StockStatus {
  if (item.availableQuantity <= 0) return 'out'
  if (item.availableQuantity <= item.reorderPoint) return 'low'
  return 'ok'
}

export const STOCK_BADGE: Record<StockStatus, { label: string; style: string }> = {
  ok: { label: 'În stoc', style: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' },
  low: { label: 'Stoc scăzut', style: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400' },
  out: { label: 'Epuizat', style: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' },
}

export const MOVEMENT_LABELS: Record<string, string> = {
  in: 'Recepție',
  out: 'Eliminare',
  adjustment: 'Corecție',
  reserve: 'Rezervat',
  release: 'Eliberat',
}

export const ADJUST_TYPE_OPTIONS = [
  { value: 'in', label: 'Recepție (adaugă stoc)' },
  { value: 'out', label: 'Eliminare (scade stoc)' },
  { value: 'adjustment', label: 'Corecție (setează total)' },
]
