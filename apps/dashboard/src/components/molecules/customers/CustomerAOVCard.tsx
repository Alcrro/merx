import type { CustomerAnalytics } from '@merx/types'

interface Props {
  analytics: CustomerAnalytics | undefined
  isLoading: boolean
  fmt: Intl.NumberFormat
}

export function CustomerAOVCard({ analytics, isLoading, fmt }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">AOV personal vs store</p>
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-5 w-32 animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-5 w-28 animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      ) : analytics ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">AOV client</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {fmt.format(analytics.aov.customer)}
              </span>
              {analytics.aov.delta > 0 ? (
                <span className="text-xs font-medium text-green-600 dark:text-green-400">↑ peste medie</span>
              ) : (
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">↓ sub medie</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">AOV store</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{fmt.format(analytics.aov.store)}</span>
          </div>
          <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Diferență: {analytics.aov.delta >= 0 ? '+' : ''}{fmt.format(analytics.aov.delta)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
