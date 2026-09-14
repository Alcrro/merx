import type { FeedItem } from '@merx/api-client'

const SEVERITY_COLORS: Record<FeedItem['severity'], string> = {
  LOW:      'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 ring-emerald-200 dark:ring-emerald-800',
  MEDIUM:   'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 ring-amber-200 dark:ring-amber-800',
  HIGH:     'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 ring-orange-200 dark:ring-orange-800',
  CRITICAL: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 ring-red-200 dark:ring-red-800',
}

export function RiskBadge({ severity }: { severity: FeedItem['severity'] }) {
  return (
    <span className={`badge gap-1 text-[11px] font-semibold ring-1 ${SEVERITY_COLORS[severity]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {severity}
    </span>
  )
}
