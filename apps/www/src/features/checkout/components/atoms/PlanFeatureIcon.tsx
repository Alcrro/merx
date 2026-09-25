import { cn } from '@/lib/utils'
import type { FeatureType } from '../../types'
import { ICON_PATHS } from '../../config'

interface PlanFeatureIconProps {
  type: FeatureType
  className?: string
}

export function PlanFeatureIcon({ type, className }: PlanFeatureIconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('w-[15px] h-[15px]', className)}
    >
      <path d={ICON_PATHS[type]} />
    </svg>
  )
}
