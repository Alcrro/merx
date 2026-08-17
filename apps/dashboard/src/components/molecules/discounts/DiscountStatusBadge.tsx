interface Props {
  isActive: boolean
  startsAt: string | null
  expiresAt: string | null
  usedCount: number
  maxUses: number | null
}

type BadgeState = 'inactive' | 'expired' | 'scheduled' | 'limit_reached' | 'active'

// Priority order is fixed: first matching rule wins.
function resolveState({ isActive, startsAt, expiresAt, usedCount, maxUses }: Props): BadgeState {
  if (!isActive) return 'inactive'
  const now = new Date()
  if (expiresAt && new Date(expiresAt) < now) return 'expired'
  if (startsAt && new Date(startsAt) > now) return 'scheduled'
  if (maxUses !== null && usedCount >= maxUses) return 'limit_reached'
  return 'active'
}

const STYLES: Record<BadgeState, string> = {
  active: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
  inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  expired: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
  scheduled: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
  limit_reached: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400',
}

const LABELS: Record<BadgeState, string> = {
  active: 'Activ',
  inactive: 'Inactiv',
  expired: 'Expirat',
  scheduled: 'Programat',
  limit_reached: 'Limită atinsă',
}

export function DiscountStatusBadge(props: Props) {
  const state = resolveState(props)
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[state]}`}>
      {LABELS[state]}
    </span>
  )
}
