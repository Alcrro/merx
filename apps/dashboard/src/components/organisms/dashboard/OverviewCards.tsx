import type { AnalyticsOverview } from '@merx/types'
import { MetricCard, MetricCardSkeleton } from '../../atoms/MetricCard'

interface Props {
  data?: AnalyticsOverview
  fmt: Intl.NumberFormat
  isLoading: boolean
}

export function OverviewCards({ data, fmt, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <MetricCardSkeleton key={i} />)}
      </div>
    )
  }

  const cards = [
    { label: 'Venit', value: fmt.format(data.revenue), change: data.revenueChange },
    { label: 'Comenzi', value: data.orders.toString(), change: data.ordersChange },
    { label: 'AOV', value: fmt.format(data.aov), change: data.aovChange },
    { label: 'Profit', value: fmt.format(data.profit), change: data.profitChange },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <MetricCard key={c.label} label={c.label} value={c.value} change={c.change} />
      ))}
    </div>
  )
}
