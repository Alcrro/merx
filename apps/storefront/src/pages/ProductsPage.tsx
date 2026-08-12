import { useState } from 'react'
import { useProducts, useCategories } from '../hooks/useProducts'
import { useStore } from '../hooks/useStore'
import { ProductGrid } from '../components/organisms/ProductGrid'
import { Button } from '../components/atoms/Button'
import { useStoreSlug } from '../contexts/StoreSlugContext'

const PAGE_SIZE = 20

export function ProductsPage() {
  const storeSlug = useStoreSlug()
  const [page, setPage] = useState(1)
  const [categoryId, setCategoryId] = useState<string | undefined>()

  const { data: store } = useStore(storeSlug)
  const { data, isLoading, isError, error, refetch } = useProducts({ slug: storeSlug, page, limit: PAGE_SIZE, categoryId })
  const { data: categories } = useCategories(storeSlug)

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0

  function handleCategory(id: string | undefined) {
    setCategoryId(id)
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Products</h1>

      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleCategory(undefined)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !categoryId ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategory(cat.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                categoryId === cat.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between mb-4">
          <span>{error instanceof Error ? error.message : 'Failed to load products.'}</span>
          <button onClick={() => refetch()} className="ml-4 font-medium underline">Retry</button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <ProductGrid
            products={data?.data ?? []}
            currency={store?.currency ?? 'EUR'}
          />
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
