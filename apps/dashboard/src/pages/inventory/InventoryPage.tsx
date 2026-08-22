import { useState } from 'react'
import { useStoreInventory } from '../../hooks/useInventory'
import { StoreInventoryTable } from '../../components/organisms/inventory/StoreInventoryTable'

export type InventoryMode = 'default' | 'physical' | 'both'

const MODES: { value: InventoryMode; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'physical', label: 'Fizic' },
  { value: 'both', label: 'Ambele' },
]

function getStoredMode(): InventoryMode {
  const v = localStorage.getItem('inventoryMode')
  return (v === 'default' || v === 'physical' || v === 'both') ? v : 'default'
}

export function InventoryPage() {
  const [mode, setMode] = useState<InventoryMode>(getStoredMode)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading } = useStoreInventory({ page, limit: 50 })

  const items = data?.data ?? []
  const filtered = search.trim()
    ? items.filter((i) => {
        const q = search.toLowerCase()
        return (
          i.productTitle.toLowerCase().includes(q) ||
          i.variantTitle.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q)
        )
      })
    : items
  const totalPages = data ? Math.ceil(data.total / 50) : 1

  const handleMode = (m: InventoryMode) => {
    setMode(m)
    localStorage.setItem('inventoryMode', m)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Inventar</h1>

        <div className="flex items-center gap-3">
          {/* Mode selector */}
          <div className="flex gap-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 p-1">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => handleMode(m.value)}
                className={[
                  'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
                  mode === m.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                ].join(' ')}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-56">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Caută produs, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-9 pr-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>
      </div>

      <StoreInventoryTable
        items={filtered}
        isLoading={isLoading}
        mode={mode}
        page={page}
        totalPages={!search ? totalPages : 1}
        onPageChange={setPage}
      />
    </div>
  )
}
