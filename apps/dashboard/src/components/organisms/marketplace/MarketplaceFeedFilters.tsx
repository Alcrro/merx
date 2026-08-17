import { useMarketplaceFeedStore, hasFiltersSelector } from '../../../stores/marketplaceFeed.store'
import { useMarketplaceCategories } from '../../../hooks/useMarketplace'
import { CategoryCascadeFilter } from '../../molecules/marketplace/CategoryCascadeFilter'
import { CountrySelect } from '../../atoms/CountrySelect'
import { LISTING_CATEGORIES, SORT_OPTIONS, DELIVERY_OPTIONS } from '../../../lib/marketplace.constants'
import type { FeedSortBy } from '@merx/api-client'

export function MarketplaceFeedFilters() {
  const {
    search, setSearch,
    category, setCategory,
    country, setCountry,
    negotiable, setNegotiable,
    sortBy, setSortBy,
    maxDeliveryDays, setMaxDeliveryDays,
    categorySlug, setCategorySlug,
    minPriceRaw, setMinPriceRaw,
    maxPriceRaw, setMaxPriceRaw,
    clearAll,
  } = useMarketplaceFeedStore()

  const hasFilters = useMarketplaceFeedStore(hasFiltersSelector)
  const { data: categories = [] } = useMarketplaceCategories()

  return (
    <div className="mb-5 flex flex-col gap-2">

      {/* Row 1: search + listing type + country + negotiable */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden divide-x divide-gray-200 dark:divide-gray-700">
          <div className="flex items-center gap-2.5 px-3.5 flex-1 min-w-0">
            <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Caută produse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center px-1.5 gap-0.5 shrink-0">
            {LISTING_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={[
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                  category === cat.value
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
                ].join(' ')}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="px-3 shrink-0">
            <CountrySelect compact value={country} onChange={setCountry} placeholder="Țară" />
          </div>

          <button
            onClick={() => setNegotiable(negotiable === true ? undefined : true)}
            className={[
              'flex items-center gap-2 px-3.5 h-full text-xs font-medium transition-colors whitespace-nowrap',
              negotiable
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50',
            ].join(' ')}
          >
            <span className={['h-1.5 w-1.5 rounded-full shrink-0 transition-colors', negotiable ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'].join(' ')} />
            Negociabil
          </button>
        </div>

        {hasFilters && (
          <button onClick={clearAll} className="shrink-0 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            Resetează
          </button>
        )}
      </div>

      {/* Row 2: category cascade + sort + delivery + price */}
      <div className="flex items-center gap-2 flex-wrap">
        <CategoryCascadeFilter
          categories={categories}
          value={categorySlug}
          onChange={setCategorySlug}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as FeedSortBy)}
          className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-indigo-400 dark:focus:border-indigo-600 transition-colors"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select
          value={maxDeliveryDays ?? ''}
          onChange={(e) => setMaxDeliveryDays(e.target.value ? Number(e.target.value) : undefined)}
          className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-indigo-400 dark:focus:border-indigo-600 transition-colors"
        >
          {DELIVERY_OPTIONS.map((o) => (
            <option key={o.value ?? 'any'} value={o.value ?? ''}>
              {o.value === undefined ? 'Livrare: orice' : `Max ${o.label}`}
            </option>
          ))}
        </select>

        <div className="flex items-center h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden divide-x divide-gray-200 dark:divide-gray-700">
          <input type="number" placeholder="Min EUR" value={minPriceRaw} min={0}
            onChange={(e) => setMinPriceRaw(e.target.value)}
            className="w-24 px-3 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 outline-none tabular-nums h-full"
          />
          <span className="px-2 text-xs text-gray-300 dark:text-gray-600 select-none">—</span>
          <input type="number" placeholder="Max EUR" value={maxPriceRaw} min={0}
            onChange={(e) => setMaxPriceRaw(e.target.value)}
            className="w-24 px-3 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 outline-none tabular-nums h-full"
          />
        </div>
      </div>
    </div>
  )
}
