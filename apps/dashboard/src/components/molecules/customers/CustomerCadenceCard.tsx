import type { CustomerAnalytics } from '@merx/types'
import { RISK_DOT } from '../../../lib/customers.constants'

interface Props {
  analytics: CustomerAnalytics | undefined
  isLoading: boolean
}

export function CustomerCadenceCard({ analytics, isLoading }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Frecvență comenzi</p>
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-5 w-40 animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-5 w-32 animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      ) : analytics ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Zile de la ultima comandă</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {analytics.cadence.daysSinceLastOrder ?? '—'}
              </span>
              {analytics.cadence.riskLevel && (
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${RISK_DOT[analytics.cadence.riskLevel]}`} />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Interval mediu între comenzi</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {analytics.cadence.avgDaysBetweenOrders != null ? `${analytics.cadence.avgDaysBetweenOrders} zile` : '—'}
            </span>
          </div>
          {!analytics.cadence.avgDaysBetweenOrders && (
            <p className="text-xs text-gray-400 dark:text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-800">
              Necesită minim 2 comenzi pentru calcul interval.
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}
