import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateListing } from '../../../hooks/useMarketplace'
import { useProducts } from '../../../hooks/useProducts'
import { Input } from '../../atoms/Input'
import { Select } from '../../atoms/Select'
import { Button } from '../../atoms/Button'
import { EarningsPreview } from '../../molecules/marketplace/EarningsPreview'
import { CATEGORY_OPTIONS, CURRENCY_OPTIONS, COUNTRY_OPTIONS, CONDITION_OPTIONS } from '../../../lib/marketplace.constants'
import type { ListingCategory, ListingCondition } from '@merx/api-client'

export function CreateListingForm() {
  const navigate = useNavigate()
  const { mutateAsync: createListing, isPending } = useCreateListing()
  const { data: productsData } = useProducts({ status: 'active', limit: 100 })

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    shippingCost: '',
    currency: 'EUR',
    negotiable: false,
    quantity: '1',
    category: 'physical' as ListingCategory,
    condition: 'new' as ListingCondition,
    city: '',
    country: 'RO',
    variantId: '',
  })
  const [error, setError] = useState<string | null>(null)

  const price = parseFloat(form.price) || 0

  const variantOptions = [
    { value: '', label: '— Fără produs asociat —' },
    ...(productsData?.data.flatMap((p) =>
      (p.variants ?? []).map((v) => ({
        value: v.id,
        label: `${p.title} — ${v.title} (${v.price.toFixed(2)} ${form.currency})`,
      }))
    ) ?? []),
  ]

  const set = (field: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await createListing({
        title: form.title,
        description: form.description || undefined,
        price,
        shippingCost: form.shippingCost ? parseFloat(form.shippingCost) : 0,
        currency: form.currency,
        negotiable: form.negotiable,
        quantity: parseInt(form.quantity) || 1,
        category: form.category,
        condition: form.condition,
        city: form.city,
        country: form.country,
        variantId: form.variantId || undefined,
      })
      navigate('/marketplace/listings/mine')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error
      setError(msg ?? 'Eroare la creare listing')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-4">
        <Select
          label="Produs din store (opțional)"
          value={form.variantId}
          onChange={(e) => set('variantId', e.target.value)}
          options={variantOptions}
        />

        <Input
          label="Titlu listing"
          required
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="ex: iPhone 14 Pro, 256GB, Space Black"
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descriere</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Descriere opțională..."
          />
        </div>

        <Select
          label="Categorie"
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          options={CATEGORY_OPTIONS}
        />

        <Select
          label="Stare produs"
          value={form.condition}
          onChange={(e) => set('condition', e.target.value)}
          options={CONDITION_OPTIONS}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Preț"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="0.00"
          />
          <Select
            label="Monedă"
            value={form.currency}
            onChange={(e) => set('currency', e.target.value)}
            options={CURRENCY_OPTIONS}
          />
        </div>

        <Input
          label="Cost livrare (opțional)"
          type="number"
          min="0"
          step="0.01"
          value={form.shippingCost}
          onChange={(e) => set('shippingCost', e.target.value)}
          placeholder="0.00 — lasă gol pentru livrare gratuită"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cantitate"
            type="number"
            min="1"
            required
            value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)}
          />
          <Input
            label="Oraș"
            required
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder="ex: București"
          />
        </div>

        <Select
          label="Țară"
          value={form.country}
          onChange={(e) => set('country', e.target.value)}
          options={COUNTRY_OPTIONS}
        />

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.negotiable}
            onChange={(e) => set('negotiable', e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Preț negociabil</span>
        </label>
      </div>

      <EarningsPreview price={price} currency={form.currency} />

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" isLoading={isPending}>Publică listing</Button>
        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Anulează</Button>
      </div>
    </form>
  )
}
