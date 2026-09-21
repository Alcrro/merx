import { CheckIcon } from '@/components/atoms/CheckIcon'
import type { PlanFeature } from '@/features/account/types'

interface PlanFeaturesListProps {
  features: PlanFeature[]
  isHighlighted: boolean
}

export function PlanFeaturesList({ features, isHighlighted }: PlanFeaturesListProps) {
  return (
    <ul className="space-y-3 flex-1 mb-8">
      {features.map((f) => (
        <li key={f.label} className="flex items-start gap-2.5">
          <CheckIcon className={isHighlighted ? 'text-white/70' : 'text-primary'} />
          <span className={`text-sm leading-snug ${isHighlighted ? 'text-white/85' : 'text-fg-muted'}`}>
            <span className={`font-medium ${isHighlighted ? 'text-white' : 'text-fg'}`}>{f.value}</span>
            {' '}{f.label}
          </span>
        </li>
      ))}
    </ul>
  )
}
