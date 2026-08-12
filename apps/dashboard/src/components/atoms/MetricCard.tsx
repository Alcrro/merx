interface Props {
  label: string
  value: string
  change?: number
}

export function MetricCard({ label, value, change }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</p>
      {change !== undefined && (
        <span
          className={`text-xs font-medium ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}
        >
          {change >= 0 ? '+' : ''}
          {change.toFixed(1)}% vs. anterior
        </span>
      )}
    </div>
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 animate-pulse">
      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
      <div className="h-7 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}
