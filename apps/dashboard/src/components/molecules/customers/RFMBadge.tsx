import type { RFMSegment } from '@merx/types'

const config: Record<RFMSegment, { label: string; className: string; tooltip: string }> = {
  champion: {
    label: 'Champion',
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    tooltip: 'Cumpărător recent, frecvent, cu valoare mare',
  },
  loyal: {
    label: 'Loial',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    tooltip: 'Cumpără des și cheltuiește mult',
  },
  potential_loyalist: {
    label: 'Potențial loial',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    tooltip: 'Cumpărător recent cu potențial de fidelizare',
  },
  at_risk: {
    label: 'La risc',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    tooltip: 'A cumpărat frecvent dar nu mai revine',
  },
  lost: {
    label: 'Pierdut',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    tooltip: 'Nu a mai cumpărat de mult timp',
  },
  new: {
    label: 'Nou',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    tooltip: 'Prima comandă recentă',
  },
}

interface Props {
  segment: RFMSegment
  size?: 'sm' | 'md'
}

export function RFMBadge({ segment, size = 'sm' }: Props) {
  const { label, className, tooltip } = config[segment]
  const sizeClass = size === 'md' ? 'px-3 py-1 text-sm font-semibold' : 'px-2 py-0.5 text-xs font-medium'

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center rounded-full ${sizeClass} ${className}`}
    >
      {label}
    </span>
  )
}
