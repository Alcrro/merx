import { useState } from 'react'
import type { ProductVariant } from '@merx/types'
import type { CreateVariantInput } from '@merx/api-client'
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'

interface VariantFormProps {
  initial?: ProductVariant
  onSave: (data: CreateVariantInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function VariantForm({ initial, onSave, onCancel, isLoading }: VariantFormProps) {
  const [sku, setSku] = useState(initial?.sku ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [price, setPrice] = useState(initial?.price.toString() ?? '')
  const [compareAtPrice, setCompareAtPrice] = useState(initial?.compareAtPrice?.toString() ?? '')
  const [cost, setCost] = useState(initial?.cost?.toString() ?? '')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sku || !title || !price) { setError('SKU, titlu și preț sunt obligatorii'); return }
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum < 0) { setError('Prețul trebuie să fie un număr pozitiv'); return }
    setError('')
    await onSave({
      sku,
      title,
      price: priceNum,
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      cost: cost ? parseFloat(cost) : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950 p-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
        <Input label="Titlu variantă" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Roșu / L" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input label="Preț" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input label="Preț comparat" type="number" min="0" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} />
        <Input label="Cost" type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" type="button" onClick={onCancel}>Anulează</Button>
        <Button type="submit" isLoading={isLoading}>{initial ? 'Salvează' : 'Adaugă variantă'}</Button>
      </div>
    </form>
  )
}
