import { cn } from '@/lib/utils'
import type { PlanFeature } from '../../types'
import { PlanFeatureRow } from '../atoms/PlanFeatureRow'

interface PlanCardProps {
  name: string
  description: string
  price: number
  badge: string
  features: PlanFeature[]
  variant: 'current' | 'new'
}

export function PlanCard({ name, description, price, badge, features, variant }: PlanCardProps) {
  const isNew = variant === 'new'
  return (
    <div
      className={cn(
        'rounded-2xl p-6 flex flex-col',
        isNew
          ? 'bg-primary text-white shadow-[0_0_40px_rgba(99,102,241,0.3)]'
          : 'bg-surface-elevated shadow-[0_0_20px_rgba(0,0,0,0.08)]'
      )}
    >
      <div className="mb-3 min-h-[26px]">
        <span
          className={cn(
            'inline-block text-xs font-semibold px-2.5 py-1 rounded-full',
            isNew ? 'bg-white/15 text-white' : 'bg-surface-subtle text-fg-muted'
          )}
        >
          {badge}
        </span>
      </div>

      <p className={cn('text-sm font-semibold uppercase tracking-widest', isNew ? 'text-white/70' : 'text-fg-muted')}>
        {name}
      </p>

      <div className="mt-3 mb-2 flex items-end gap-1">
        <span className="text-4xl font-extrabold">€{price}</span>
        <span className={cn('text-sm mb-1', isNew ? 'text-white/70' : 'text-fg-muted')}>/lună</span>
      </div>

      <div className="mb-6 min-h-[40px]">
        <p className={cn('text-xs leading-relaxed', isNew ? 'text-white/70' : 'text-fg-muted')}>{description}</p>
      </div>

      <ul className="space-y-3 flex-1">
        {features.map((f) => (
          <PlanFeatureRow key={f.label} type={f.type} value={f.value} label={f.label} isNew={isNew} />
        ))}
      </ul>
    </div>
  )
}
