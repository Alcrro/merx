'use client'

import { useTranslations } from 'next-intl'
import { CheckIcon } from '@/components/atoms/CheckIcon'
import { trackEvent } from '@/lib/analytics'
import type { PricingPlan } from '@/features/pricing/config'

interface PricingCardProps {
  plan: PricingPlan
  currentPlanId?: string | null
}

export function PricingCard({ plan, currentPlanId }: PricingCardProps) {
  const t = useTranslations('pricing.card')
  const isHighlight = plan.highlight
  const isEnterprise = plan.id === 'enterprise'
  const isCurrent = currentPlanId === plan.id
  const hasActiveSub = Boolean(currentPlanId)

  return (
    <div
      className={`relative rounded-2xl p-6 flex flex-col ${
        isHighlight
          ? 'bg-primary text-white shadow-[0_0_40px_rgba(99,102,241,0.3)]'
          : 'bg-surface-elevated shadow-[0_0_20px_rgba(0,0,0,0.08)] text-fg'
      }`}
    >
      {isHighlight && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-block bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
            {t('recommended')}
          </span>
        </div>
      )}

      <div className="mb-3 min-h-[26px] flex items-start">
        {isCurrent ? (
          <span className="inline-block bg-success/15 text-success text-xs font-semibold px-2.5 py-1 rounded-full">
            {t('currentPlan')}
          </span>
        ) : !hasActiveSub && plan.trial ? (
          <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
            {plan.trial}
          </span>
        ) : null}
      </div>

      <p className={`text-sm font-semibold uppercase tracking-widest ${isHighlight ? 'text-white/70' : 'text-fg-muted'}`}>
        {plan.name}
      </p>

      <div className="mt-3 mb-2">
        {plan.price !== null ? (
          <div className="flex items-end gap-1">
            <span className="text-4xl font-extrabold">€{plan.price}</span>
            <span className={`text-sm mb-1 ${isHighlight ? 'text-white/70' : 'text-fg-muted'}`}>{t('perMonth')}</span>
          </div>
        ) : (
          <span className="text-4xl font-light text-fg">{t('contactUs')}</span>
        )}
      </div>

      <div className="mb-6 min-h-[56px]">
        {plan.description && (
          <p className={`text-xs leading-relaxed ${isHighlight ? 'text-white/70' : 'text-fg-muted'}`}>
            {plan.description}
          </p>
        )}
      </div>

      <ul className="space-y-3 flex-1 mb-8">
        {plan.features.map((f) => (
          <li key={f.label} className="flex items-start gap-2.5">
            <CheckIcon className={isHighlight ? 'text-white/70' : 'text-primary'} />
            <span className={`text-sm leading-snug ${isHighlight ? 'text-white/85' : 'text-fg-muted'}`}>
              <span className={`font-medium ${isHighlight ? 'text-white' : 'text-fg'}`}>{f.value}</span>
              {' '}{f.label}
            </span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <span
          className={`block w-full text-center rounded-xl px-4 py-3 text-sm font-semibold opacity-40 cursor-default ${
            isHighlight ? 'bg-white text-primary' : 'bg-surface-subtle text-fg-muted'
          }`}
        >
          {t('currentPlan')}
        </span>
      ) : hasActiveSub && !isEnterprise ? (
        <a
          href={`/checkout/plan-change?planId=${plan.id}&currentPlanId=${currentPlanId ?? ''}`}
          onClick={() => trackEvent('pricing_plan_cta_clicked', { plan: plan.id })}
          className={`block w-full text-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
            isHighlight
              ? 'bg-white text-primary hover:bg-primary-subtle'
              : 'bg-primary text-white hover:bg-primary-hover'
          }`}
        >
          {t('changePlan')}
        </a>
      ) : (
        <a
          href={plan.cta.href}
          aria-label={t('ctaAriaLabel', { label: plan.cta.label, name: plan.name })}
          onClick={() => trackEvent('pricing_plan_cta_clicked', { plan: plan.id })}
          className={`block w-full text-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
            isHighlight
              ? 'bg-white text-primary hover:bg-primary-subtle'
              : isEnterprise
                ? 'bg-surface border border-line/60 text-fg hover:bg-surface-subtle'
                : 'bg-primary text-white hover:bg-primary-hover'
          }`}
        >
          {plan.cta.label}
        </a>
      )}
    </div>
  )
}
