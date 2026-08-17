import type { CustomerAnalytics } from '@merx/types'

interface Props {
  analytics: CustomerAnalytics | undefined
  isLoading: boolean
  fmt: Intl.NumberFormat
}

export function CustomerTopProducts({ analytics, isLoading, fmt }: Props) {
  if (!isLoading && (!analytics || analytics.topProducts.length === 0)) return null

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Produse preferate</h2>
      </div>
      {isLoading ? (
        <div className="p-5 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-5 animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Produs</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Comenzi</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Total cheltuit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {analytics?.topProducts.map((p) => (
                <tr key={p.productId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.title}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-500 dark:text-gray-400">{p.orderCount}×</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-gray-900 dark:text-gray-100">
                    {fmt.format(p.totalSpent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
