import { useState } from 'react'
import { useSearchCatalog, useCatalogCategories, useMyStoreProducts } from '../../../hooks/useCatalog'
import { useDebounce } from '../../../hooks/useDebounce'
import { CatalogTableRow } from './CatalogTableRow'
import { Button } from '../../atoms/Button'

const PAGE_SIZE = 20

const selectCls =
  'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-500'

interface Props {
  onRequestProduct: () => void
}

export function CatalogTable({ onRequestProduct }: Props) {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search, 300)
  const { data: categories = [] } = useCatalogCategories()

  const flatCategories = [
    ...new Map(
      categories.flatMap((c) => [c, ...(c.children ?? [])]).map((c) => [c.id, c])
    ).values(),
  ]

  const { data: myProducts = [] } = useMyStoreProducts()
  const { data, isLoading } = useSearchCatalog({
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    page,
    limit: PAGE_SIZE,
  })

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Caută în catalog..."
          className={`${selectCls} min-w-52`}
        />
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1) }}
          className={selectCls}
        >
          <option value="">Toate categoriile</option>
          {flatCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.parentId ? `  ${c.name}` : c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400 dark:text-gray-500">
            Se încarcă...
          </div>
        ) : !data?.data.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {debouncedSearch || categoryId
                ? 'Niciun produs găsit pentru filtrele selectate.'
                : 'Catalogul este momentan gol.'}
            </p>
            <Button variant="outline" size="sm" onClick={onRequestProduct}>
              Cere produs nou
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 text-left">
              <tr>
                <th className="px-4 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Produs</th>
                <th className="px-4 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Categorie</th>
                <th className="px-4 py-3.5 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Variante</th>
                <th className="px-4 py-3.5 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.data.map((product) => (
                <CatalogTableRow key={product.id} product={product} myProducts={myProducts} />
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
