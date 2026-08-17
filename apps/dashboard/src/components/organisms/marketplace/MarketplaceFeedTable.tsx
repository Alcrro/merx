import { useNavigate } from 'react-router-dom'
import { useMarketplaceFeedStore, hasFiltersSelector } from '../../../stores/marketplaceFeed.store'
import { useListings } from '../../../hooks/useMarketplace'
import { useDebounce } from '../../../hooks/useDebounce'
import { MarketplaceProductRow } from '../../molecules/marketplace/MarketplaceProductRow'
import { Spinner } from '../../atoms/Spinner'

const COL_GRID = 'minmax(0,1fr) 180px 90px 120px'

export function MarketplaceFeedTable() {
  const navigate = useNavigate()

  const {
    search, category, country, negotiable,
    sortBy, maxDeliveryDays, categorySlug,
    minPriceRaw, maxPriceRaw,
    page, setPage, clearAll,
  } = useMarketplaceFeedStore()

  const hasFilters = useMarketplaceFeedStore(hasFiltersSelector)

  const minPrice = useDebounce(minPriceRaw, 400)
  const maxPrice = useDebounce(maxPriceRaw, 400)

  const { data, isLoading } = useListings({
    search: search || undefined,
    category: category || undefined,
    country: country || undefined,
    negotiable,
    sortBy,
    maxDeliveryDays,
    categorySlug: categorySlug || undefined,
    minPrice: minPrice !== '' ? Number(minPrice) : undefined,
    maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
    page,
    limit: 20,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner className="h-5 w-5" />
        <span className="text-sm text-gray-400 dark:text-gray-500">Se încarcă...</span>
      </div>
    )
  }

  if (!data?.items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2">
        <svg className="h-10 w-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.25} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <p className="text-sm text-gray-500 dark:text-gray-400">Niciun produs găsit.</p>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
            Șterge filtrele
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div
          className="grid items-center gap-4 px-5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40"
          style={{ gridTemplateColumns: COL_GRID }}
        >
          <div className="flex items-center gap-2 pl-[60px]">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Produs</span>
            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full tabular-nums">
              {data.total}
            </span>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">Preț</span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-center">Risk</span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">Acțiune</span>
        </div>

        {data.items.map((item) => (
          <MarketplaceProductRow
            key={item.id}
            item={item}
            onNavigate={(variantId) => {
              const url = `/marketplace/listings/${item.id}`
              navigate(variantId ? `${url}?variantId=${variantId}` : url)
            }}
          />
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-gray-400 dark:text-gray-500">Pagina {page} din {data.totalPages}</span>
          <div className="flex items-center gap-1.5">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            >
              ← Anterior
            </button>
            <button disabled={page === data.totalPages} onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Următor →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
