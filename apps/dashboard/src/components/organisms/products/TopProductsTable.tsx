import type { TopProduct } from '@merx/types'

interface Props {
  data?: TopProduct[]
  fmt: Intl.NumberFormat
  isLoading: boolean
}

export function TopProductsTable({ data, fmt, isLoading }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top produse</p>
      </div>
      {isLoading ? (
        <div className="h-48 animate-pulse bg-gray-50 dark:bg-gray-800" />
      ) : !data || data.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-400 dark:text-gray-500">
          Nu există date pentru această perioadă.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60 text-left">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-400 dark:text-gray-500">Produs</th>
              <th className="px-5 py-3 font-medium text-gray-400 dark:text-gray-500 text-right">Buc.</th>
              <th className="px-5 py-3 font-medium text-gray-400 dark:text-gray-500 text-right">Venit</th>
              <th className="px-5 py-3 font-medium text-gray-400 dark:text-gray-500 text-right">Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {data.map((p, i) => (
              <tr key={p.productId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-5 py-3">
                  <span className="text-xs text-gray-400 dark:text-gray-500 mr-2">{i + 1}.</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{p.productTitle}</span>
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-gray-600 dark:text-gray-400">
                  {p.unitsSold}
                </td>
                <td className="px-5 py-3 text-right tabular-nums font-semibold text-gray-900 dark:text-gray-100">
                  {fmt.format(p.revenue)}
                </td>
                <td
                  className={`px-5 py-3 text-right tabular-nums font-medium ${
                    p.profit >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-500 dark:text-red-400'
                  }`}
                >
                  {fmt.format(p.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
