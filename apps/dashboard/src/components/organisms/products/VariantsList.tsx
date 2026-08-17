import { useState } from 'react'
import type { ProductVariant } from '@merx/types'
import type { CreateVariantInput } from '@merx/api-client'
import { VariantForm } from './VariantForm'
import { ConfirmDialog } from '../../molecules/shared/ConfirmDialog'
import { Button } from '../../atoms/Button'

interface VariantsListProps {
  productId: string
  variants: ProductVariant[]
  onAdd: (data: CreateVariantInput) => Promise<void>
  onUpdate: (variantId: string, data: Partial<CreateVariantInput>) => Promise<void>
  onDelete: (variantId: string) => Promise<void>
  isAdding?: boolean
  isUpdating?: boolean
  isDeleting?: boolean
}

export function VariantsList({ variants, onAdd, onUpdate, onDelete, isAdding, isUpdating, isDeleting }: VariantsListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleAdd = async (data: CreateVariantInput) => {
    await onAdd(data)
    setShowAddForm(false)
  }

  const handleUpdate = async (variantId: string, data: CreateVariantInput) => {
    await onUpdate(variantId, data)
    setEditingId(null)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    await onDelete(deletingId)
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Variante ({variants.length})</h3>
        {!showAddForm && (
          <Button variant="ghost" onClick={() => setShowAddForm(true)}>
            + Adaugă variantă
          </Button>
        )}
      </div>

      {variants.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {variants.map((v) =>
            editingId === v.id ? (
              <div key={v.id} className="p-3">
                <VariantForm
                  initial={v}
                  onSave={(data) => handleUpdate(v.id, data)}
                  onCancel={() => setEditingId(null)}
                  isLoading={isUpdating}
                />
              </div>
            ) : (
              <div key={v.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex gap-6">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{v.title}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{v.sku}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{v.price.toFixed(2)}</span>
                  {v.compareAtPrice && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 line-through">{v.compareAtPrice.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(v.id)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                    Editează
                  </button>
                  <button onClick={() => setDeletingId(v.id)} className="text-xs text-red-500 dark:text-red-400 hover:underline">
                    Șterge
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {showAddForm && (
        <VariantForm
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
          isLoading={isAdding}
        />
      )}

      {deletingId && (
        <ConfirmDialog
          title="Șterge variantă"
          message="Această acțiune este permanentă."
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  )
}
