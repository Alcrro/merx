interface Props {
  label: string
  value: string
  change?: number
}

export function MetricCard({ label, value, change }: Props) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <p className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold text-fg-primary mb-1">{value}</p>
      {change !== undefined && (
        <span className={`text-xs font-medium ${change >= 0 ? 'text-success-text' : 'text-danger-text'}`}>
          {change >= 0 ? '+' : ''}
          {change.toFixed(1)}% vs. anterior
        </span>
      )}
    </div>
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 animate-pulse">
      <div className="h-3 w-20 bg-skeleton rounded mb-3" />
      <div className="h-7 w-28 bg-skeleton rounded mb-2" />
      <div className="h-3 w-16 bg-skeleton rounded" />
    </div>
  )
}
