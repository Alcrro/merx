import { useState } from 'react'
import type { InventoryItem } from '@merx/types'
import { useUpdateReorderPoint } from '../../../hooks/useInventory'

export function ReorderInput({ item }: { item: InventoryItem }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(item.reorderPoint))
  const { mutateAsync: update, isPending } = useUpdateReorderPoint(item.variantId)

  const handleSave = async () => {
    const parsed = parseInt(value, 10)
    if (!isNaN(parsed) && parsed >= 0) await update(parsed)
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
