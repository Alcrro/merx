import type { InventoryItem } from '@merx/types'

export type StockStatus = 'ok' | 'low' | 'out'

export function stockStatus(item: InventoryItem): StockStatus {
  if (item.availableQuantity <= 0) return 'out'
  if (item.availableQuantity <= item.reorderPoint) return 'low'
  return 'ok'
}

export const STOCK_BADGE: Record<StockStatus, { label: string; style: string }> = {
  ok:  { label: 'În stoc',     style: 'badge-success' },
  low: { label: 'Stoc scăzut', style: 'badge-warning' },
  out: { label: 'Epuizat',     style: 'badge-danger' },
}

export const MOVEMENT_LABELS: Record<string, string> = {
  in:         'Recepție',
  out:        'Eliminare',
  adjustment: 'Corecție',
  reserve:    'Rezervat',
  release:    'Eliberat',
}

export const ADJUST_TYPE_OPTIONS = [
  { value: 'in',         label: 'Recepție (adaugă stoc)' },
  { value: 'out',        label: 'Eliminare (scade stoc)' },
  { value: 'adjustment', label: 'Corecție (setează total)' },
]
