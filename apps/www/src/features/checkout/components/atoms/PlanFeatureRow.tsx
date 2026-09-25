import { cn } from '@/lib/utils'
import type { FeatureType } from '../../types'
import { PlanFeatureIcon } from './PlanFeatureIcon'
import { ICON_CLS, TEXT_CLS, VALUE_CLS } from '../styles/planFeatureRow.styles'

interface PlanFeatureRowProps {
  type: FeatureType
  value?: string
  label: string
  isNew: boolean
}

export function PlanFeatureRow({ type, value, label, isNew }: PlanFeatureRowProps) {
  const variant = isNew ? 'new' : 'current'
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <PlanFeatureIcon type={type} className={cn('flex-shrink-0 mt-0.5', ICON_CLS[variant][type])} />
      <span className={cn('leading-snug', TEXT_CLS[variant])}>
        {value && <span className={VALUE_CLS[variant]}>{value}</span>}
        {value && label ? ' ' : ''}
        {label}
      </span>
    </li>
  )
}
