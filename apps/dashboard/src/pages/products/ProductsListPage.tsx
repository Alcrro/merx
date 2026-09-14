import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMyStoreProducts } from '../../hooks/useCatalog'
import { useAuth } from '../../hooks/useAuth'
import { formatMoney } from '../../lib/format'
import { Button } from '../../components/atoms/Button'

export function ProductsListPage() {
  const navigate = useNavigate()
  const { store } = useAuth()
  const currency = store?.currency ?? 'EUR'
  const [search, setSearch] = useState('')

  const { data: storeProducts = [], isLoading } = useMyStoreProducts()

  const filtered = storeProducts.filter((sp) =>
    (sp.catalogProduct?.title ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Produsele mele</h1>
        <Button to="/products/catalog">+ Adaugă din catalog</Button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Caută produse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400 dark:text-gray-500">Se încarcă...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {search ? 'Niciun produs găsit.' : 'Nu ai adăugat încă niciun produs în store.'}
            </p>
            {!search && (
              <Button variant="outline" size="sm" to="/products/catalog">
                Explorează catalogul
              </Button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Produs</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Variante</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Preț de la</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Adăugat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((sp) => {
                const variants = sp.variants ?? []
                const prices = variants.map((v) => v.customPrice ?? v.catalogVariant?.suggestedPrice ?? 0)
                const minPrice = prices.length ? Math.min(...prices) : null

                return (
                  <tr
                    key={sp.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                    onClick={() => navigate(`/products/store/${sp.id}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{sp.catalogProduct?.title ?? '—'}</p>
                      {sp.catalogProduct?.category?.name && (
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{sp.catalogProduct.category.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 tabular-nums">{variants.length}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 tabular-nums">
                      {minPrice !== null ? formatMoney(minPrice, currency) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                      {new Date(sp.addedAt).toLocaleDateString('ro-RO')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
