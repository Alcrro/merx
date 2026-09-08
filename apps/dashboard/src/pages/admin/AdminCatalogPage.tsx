import { useState } from 'react'
import type { AdminSearchCatalogParams } from '@merx/api-client'
import { useAdminSearchCatalog } from '../../hooks/useCatalog'
import { useDebounce } from '../../hooks/useDebounce'
import { Button } from '../../components/atoms/Button'
import { AdminCatalogTableRow } from './AdminCatalogTableRow'

const STATUS_OPTIONS: { label: string; value: AdminSearchCatalogParams['status'] | '' }[] = [
  { label: 'Toate', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Arhivate', value: 'archived' },
]

const PAGE_SIZE = 20

const selectCls =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-500'

export function AdminCatalogPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AdminSearchCatalogParams['status'] | ''>('')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search, 300)
  const { data, isLoading } = useAdminSearchCatalog({
    search: debouncedSearch || undefined,
    status: status || undefined,
    page,
    limit: PAGE_SIZE,
  })

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Admin — Catalog</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Gestionează produsele din catalogul global.</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Caută produse..."
          className={`${selectCls} min-w-52`}
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as AdminSearchCatalogParams['status'] | ''); setPage(1) }}
          className={selectCls}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400 dark:text-gray-500">
            Se încarcă...
          </div>
        ) : !data?.data.length ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-500 dark:text-gray-400">
            Niciun produs găsit.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 text-left">
              <tr>
                <th className="px-4 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Produs</th>
                <th className="px-4 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Categorie</th>
                <th className="px-4 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Variante</th>
                <th className="px-4 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Store-uri</th>
                <th className="px-4 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Acțiuni</th>
                <th className="px-4 py-3.5 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.data.map((product) => (
                <AdminCatalogTableRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            ← Anterior
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">{page} / {totalPages}</span>
          <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            Următor →
          </Button>
        </div>
      )}
    </div>
  )
}
