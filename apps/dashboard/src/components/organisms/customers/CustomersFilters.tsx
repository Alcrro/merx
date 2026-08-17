import type { CustomerSortBy, RFMSegment } from '@merx/types'
import { useCustomersListStore } from '../../../stores/customersList.store'
import { SORT_OPTIONS, SEGMENT_OPTIONS } from '../../../lib/customers.constants'

const SELECT_CLASS = 'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-500'

export function CustomersFilters() {
  const { searchInput, sortBy, segment, setSearchInput, setSortBy, setSegment } = useCustomersListStore()

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="Caută după email sau nume..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className={`w-64 ${SELECT_CLASS}`}
      />
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as CustomerSortBy)} className={SELECT_CLASS}>
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select value={segment} onChange={(e) => setSegment(e.target.value as RFMSegment | 'all')} className={SELECT_CLASS}>
        {SEGMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
