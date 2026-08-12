import { useEffect, useState } from 'react'
import type { Product, ProductCategory, ProductStatus } from '@merx/types'
import type { CreateProductInput } from '@merx/api-client'
import { Input } from '../atoms/Input'
import { Select } from '../atoms/Select'
import { Button } from '../atoms/Button'

interface ProductFormProps {
  initial?: Product
  categories: ProductCategory[]
  onSave: (data: CreateProductInput) => Promise<void>
  isLoading?: boolean
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Activ' },
  { value: 'archived', label: 'Arhivat' },
]

export function ProductForm({ initial, categories, onSave, isLoading }: ProductFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? 'draft')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [vendor, setVendor] = useState(initial?.vendor ?? '')
  const [productType, setProductType] = useState(initial?.productType ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (initial) {
      setTitle(initial.title)
      setDescription(initial.description ?? '')
      setStatus(initial.status)
      setCategoryId(initial.categoryId ?? '')
      setVendor(initial.vendor ?? '')
      setProductType(initial.productType ?? '')
    }
  // intentional: sync only when a different product is loaded, not on reference equality
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Titlul este obligatoriu'); return }
    setError('')
    await onSave({
      title,
      description: description || null,
      status,
      categoryId: categoryId || null,
      vendor: vendor || null,
      productType: productType || null,
    })
  }

  const categoryOptions = [
    { value: '', label: 'Fără categorie' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Titlu produs"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={error}
        autoFocus={!initial}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descriere</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus)}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Categorie"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={categoryOptions}
        />
        <Input label="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
      </div>

      <Input label="Tip produs" value={productType} onChange={(e) => setProductType(e.target.value)} />

      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isLoading}>
          {initial ? 'Salvează modificările' : 'Creează produs'}
        </Button>
      </div>
    </form>
  )
}
