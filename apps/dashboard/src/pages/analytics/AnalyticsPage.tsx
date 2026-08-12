import { useState, useMemo } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useAnalyticsOverview, useRevenueChart, useTopProducts } from '../../hooks/useAnalytics'
import { OverviewCards } from '../../components/organisms/OverviewCards'
import { RevenueChart } from '../../components/organisms/RevenueChart'
import { TopProductsTable } from '../../components/organisms/TopProductsTable'

const DAY_OPTIONS = [7, 14, 30, 90]

export function AnalyticsPage() {
  const [days, setDays] = useState(30)
  const { store } = useAuth()
  const fmt = useMemo(
    () => new Intl.NumberFormat('ro-RO', { style: 'currency', currency: store?.currency ?? 'EUR', maximumFractionDigits: 0 }),
    [store?.currency]
  )

  const { data: overview, isLoading: loadingOverview } = useAnalyticsOverview(days)
  const { data: chart, isLoading: loadingChart } = useRevenueChart(days)
  const { data: topProducts, isLoading: loadingTopProducts } = useTopProducts(days)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Analytics</h1>
        <div className="flex gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                days === d
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {d}z
            </button>
          ))}
        </div>
      </div>

      <OverviewCards data={overview} fmt={fmt} isLoading={loadingOverview} />
      <RevenueChart data={chart} fmt={fmt} isLoading={loadingChart} />
      <TopProductsTable data={topProducts} fmt={fmt} isLoading={loadingTopProducts} />
    </div>
  )
}
