'use client'

import { useTranslations } from 'next-intl'
import type { PlanFeature } from '@/features/account/types'
import { PlanFeaturesList } from '../molecules/PlanFeaturesList'
import { SubscriptionPlanCta } from './SubscriptionPlanCta'

interface SubscriptionPlanCardProps {
  id: string
  name: string
  price: number | null
  description: string
  features: PlanFeature[]
  isHighlighted: boolean
  isCurrent: boolean
  mode?: 'checkout' | 'switch'
}

export function SubscriptionPlanCard({
  id,
  name,
  price,
  description,
  features,
  isHighlighted,
  isCurrent,
  mode = 'checkout',
}: SubscriptionPlanCardProps) {
  const t = useTranslations('account.subscription.upgrade')
  const tc = useTranslations('pricing.card')

  const isEnterprise = id === 'enterprise'

  return (
    <div
      className={`relative rounded-2xl p-6 flex flex-col ${
        isHighlighted
          ? 'bg-primary text-white shadow-2xl shadow-primary/30 ring-2 ring-primary'
          : 'bg-surface-elevated border border-line-strong shadow-sm text-fg'
      }`}
    >
      {isHighlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-block bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
            {t('recommended')}
          </span>
        </div>
      )}

      <p className={`text-sm font-semibold uppercase tracking-widest ${isHighlighted ? 'text-white/70' : 'text-fg-muted'}`}>
        {name}
      </p>

      <div className="mt-3 mb-2">
        {price !== null ? (
          <div className="flex items-end gap-1">
            <span className="text-4xl font-extrabold">€{price}</span>
            <span className={`text-sm mb-1 ${isHighlighted ? 'text-white/70' : 'text-fg-muted'}`}>{tc('perMonth')}</span>
          </div>
        ) : (
          <span className="text-4xl font-extrabold">{tc('contactUs')}</span>
        )}
      </div>

      <p className={`text-xs mb-6 leading-relaxed ${isHighlighted ? 'text-white/70' : 'text-fg-subtle'}`}>
        {description}
      </p>

      <PlanFeaturesList features={features} isHighlighted={isHighlighted} />

      <SubscriptionPlanCta
        id={id}
        name={name}
        isCurrent={isCurrent}
        isEnterprise={isEnterprise}
        isHighlighted={isHighlighted}
        mode={mode}
      />
    </div>
  )
}
