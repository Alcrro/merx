import { useEarningsPreview } from '../../../hooks/useMarketplace'

export function EarningsPreview({ price, currency }: { price: number; currency: string }) {
  const { data, isFetching } = useEarningsPreview(price, currency)

  if (price <= 0) return null

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
        Estimare câștiguri
      </p>
      {isFetching || !data ? (
        <div className="text-sm text-gray-400 dark:text-gray-500">Se calculează...</div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Preț listing</span>
            <span className="text-gray-900 dark:text-gray-100">{data.amount.toFixed(2)} {data.currency}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Stripe fee</span>
            <span className="text-red-500 dark:text-red-400">− {data.stripeFee.toFixed(2)} {data.currency}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Comision Merx (2%)</span>
            <span className="text-red-500 dark:text-red-400">− {data.merxCommission.toFixed(2)} {data.currency}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-gray-700 dark:text-gray-300">Vei primi</span>
            <span className="text-green-600 dark:text-green-400">{data.sellerPayout.toFixed(2)} {data.currency}</span>
          </div>
        </div>
      )}
    </div>
  )
}
