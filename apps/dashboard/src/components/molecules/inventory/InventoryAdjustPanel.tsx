import { useState } from 'react'
import type { InventoryItem } from '@merx/types'
import { useAdjustInventory, useInventoryMovements } from '../../../hooks/useInventory'
import { Button } from '../../atoms/Button'
import { Input } from '../../atoms/Input'
import { Select } from '../../atoms/Select'
import { MOVEMENT_LABELS, ADJUST_TYPE_OPTIONS } from '../../../lib/inventory.constants'

export function InventoryAdjustPanel({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
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
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {item.variant.title} · <span className="font-mono">{item.variant.sku}</span>
          </p>
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
        <Input label="Notă (opțional)" value={note} onChange={(e) => setNote(e.target.value)} />
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
