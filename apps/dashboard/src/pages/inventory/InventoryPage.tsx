import { useState } from 'react'
import type { InventoryItem } from '@merx/types'
import { useInventory, useAdjustInventory, useUpdateReorderPoint, useInventoryMovements } from '../../hooks/useInventory'
import { Button } from '../../components/atoms/Button'
import { Input } from '../../components/atoms/Input'
import { Select } from '../../components/atoms/Select'

type StockStatus = 'ok' | 'low' | 'out'

function stockStatus(item: InventoryItem): StockStatus {
  if (item.availableQuantity <= 0) return 'out'
  if (item.availableQuantity <= item.reorderPoint) return 'low'
  return 'ok'
}

const STOCK_BADGE: Record<StockStatus, { label: string; style: string }> = {
  ok: { label: 'În stoc', style: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' },
  low: { label: 'Stoc scăzut', style: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400' },
  out: { label: 'Epuizat', style: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' },
}

const MOVEMENT_LABELS: Record<string, string> = {
  in: 'Recepție',
  out: 'Eliminare',
  adjustment: 'Corecție',
  reserve: 'Rezervat',
  release: 'Eliberat',
}

const ADJUST_TYPE_OPTIONS = [
  { value: 'in', label: 'Recepție (adaugă stoc)' },
  { value: 'out', label: 'Eliminare (scade stoc)' },
  { value: 'adjustment', label: 'Corecție (setează total)' },
]

function AdjustPanel({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const [type, setType] = useState<'in' | 'out' | 'adjustment'>('in')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const { mutateAsync: adjust, isPending } = useAdjustInventory(item.variantId)
  const { data: movements } = useInventoryMovements(item.variantId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const qty = parseInt(quantity, 10)
    if (isNaN(qty) || qty < 0) { setError('Introdu o cantitate validă'); return }
    setError('')
    try {
      await adjust({ type, quantity: qty, note: note || undefined })
      setQuantity('')
      setNote('')
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Eroare la ajustare')
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950 p-5 flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.variant.productTitle}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.variant.title} · <span className="font-mono">{item.variant.sku}</span></p>
        </div>
        <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm">✕</button>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.quantity}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Total</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{item.reservedQuantity}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Rezervat</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{item.availableQuantity}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Disponibil</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Select
          label="Tip ajustare"
          value={type}
          options={ADJUST_TYPE_OPTIONS}
          onChange={(e) => setType(e.target.value as typeof type)}
        />
        <Input
          label={type === 'adjustment' ? 'Cantitate nouă (total)' : 'Cantitate'}
          type="number"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={error}
        />
        <Input
          label="Notă (opțional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" type="button" onClick={onClose}>Anulează</Button>
          <Button type="submit" isLoading={isPending}>Aplică</Button>
        </div>
      </form>

      {movements && movements.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Ultimele mișcări</p>
          <div className="flex flex-col gap-1">
            {movements.slice(0, 8).map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{MOVEMENT_LABELS[m.type] ?? m.type}</span>
                <span className={m.quantity >= 0 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-500 dark:text-red-400 font-medium'}>
                  {m.quantity >= 0 ? '+' : ''}{m.quantity}
                </span>
                <span className="text-gray-400 dark:text-gray-500">{new Date(m.createdAt).toLocaleDateString('ro-RO')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ReorderInput({ item }: { item: InventoryItem }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(item.reorderPoint))
  const { mutateAsync: update, isPending } = useUpdateReorderPoint(item.variantId)

  const handleSave = async () => {
    const parsed = parseInt(value, 10)
    if (!isNaN(parsed) && parsed >= 0) {
      await update(parsed)
    }
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 tabular-nums"
        title="Click pentru editare"
      >
        {item.reorderPoint}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-16 rounded border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1 py-0.5 text-sm text-center outline-none focus:ring-1 focus:ring-indigo-500"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') void handleSave()
          if (e.key === 'Escape') setEditing(false)
        }}
      />
      <button
        onClick={() => void handleSave()}
        disabled={isPending}
        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
      >
        ✓
      </button>
    </div>
  )
}

export function InventoryPage() {
  const [page, setPage] = useState(1)
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [adjustingId, setAdjustingId] = useState<string | null>(null)
  const { data, isLoading } = useInventory({ page, limit: 50 })

  const items = data?.data ?? []
  const filtered = lowStockOnly ? items.filter((i) => stockStatus(i) !== 'ok') : items
  const totalPages = data ? Math.ceil(data.total / 50) : 1

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Inventar</h1>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          Doar stoc scăzut / epuizat
        </label>
      </div>

      {adjustingId && (() => {
        const item = items.find((i) => i.variantId === adjustingId)
        return item ? <div className="mb-5"><AdjustPanel item={item} onClose={() => setAdjustingId(null)} /></div> : null
      })()}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400 dark:text-gray-500">Se încarcă...</div>
        ) : filtered.length === 0 ? (
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
              {filtered.map((item) => {
                const status = stockStatus(item)
                const badge = STOCK_BADGE[status]
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
                    <td className="px-4 py-3 text-right">
                      <ReorderInput item={item} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.style}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        onClick={() => setAdjustingId(isAdjusting ? null : item.variantId)}
                      >
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
          <Button variant="ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Anterior</Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">{page} / {totalPages}</span>
          <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Următor →</Button>
        </div>
      )}
    </div>
  )
}
