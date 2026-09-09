import { useState, useEffect, useRef } from 'react'
import type { StoreInventoryItem } from '@merx/types'
import { useSetStoreStock } from '../../../hooks/useInventory'
import { Button } from '../../atoms/Button'

interface Props {
  item: StoreInventoryItem
  onClose: () => void
}

type StockType = 'in' | 'out' | 'adjustment'

const TYPES: { value: StockType; label: string; description: string }[] = [
  { value: 'in',         label: 'Recepție',  description: 'Adaugă la stocul existent' },
  { value: 'out',        label: 'Eliminare', description: 'Scade din stocul existent' },
  { value: 'adjustment', label: 'Corecție',  description: 'Setează totalul exact' },
]

export function StockUpdateModal({ item, onClose }: Props) {
  const [type, setType] = useState<StockType>('in')
  const [qty, setQty] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate, isPending } = useSetStoreStock(item.storeProductVariantId)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const quantity = parseInt(qty, 10)
  const canSave = !isNaN(quantity) && quantity >= 0

  const preview = () => {
    if (!canSave) return null
    if (type === 'in') return item.quantity + quantity
    if (type === 'out') return Math.max(0, item.quantity - quantity)
    return quantity
  }
  const previewQty = preview()

  const handleSave = () => {
    if (!canSave) return
    mutate({ type, quantity }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Actualizare stoc</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{item.productTitle}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{item.variantTitle}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">Stoc curent:</span>
            <span className="text-sm font-semibold tabular-nums text-gray-800 dark:text-gray-200">{item.quantity}</span>
            {previewQty !== null && previewQty !== item.quantity && (
              <>
                <span className="text-gray-300 dark:text-gray-600">→</span>
                <span className={`text-sm font-semibold tabular-nums ${previewQty > item.quantity ? 'text-green-600 dark:text-green-400' : previewQty < item.quantity ? 'text-red-500 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                  {previewQty}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Type selector */}
          <div className="flex flex-col gap-2">
            {TYPES.map((t) => (
              <label key={t.value} className={[
                'flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors',
                type === t.value
                  ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
              ].join(' ')}>
                <input
                  type="radio"
                  name="stockType"
                  value={t.value}
                  checked={type === t.value}
                  onChange={() => setType(t.value)}
                  className="mt-0.5 accent-indigo-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{t.description}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
              Cantitate
            </label>
            <input
              ref={inputRef}
              type="number"
              min={0}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && canSave) handleSave() }}
              placeholder="0"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30 transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <Button variant="ghost" className="flex-1 justify-center" onClick={onClose}>
            Anulează
          </Button>
          <Button
            variant="primary"
            className="flex-1 justify-center"
            disabled={!canSave}
            isLoading={isPending}
            onClick={handleSave}
          >
            Actualizează
          </Button>
        </div>
      </div>
    </div>
  )
}
