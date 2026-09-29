'use client'

import { useActionState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { upgradeSubscriptionAction } from '@/features/account/actions'
import type { AccountActionState } from '@/features/account/actions'
import type { ChangeType, PlanFeature } from '../types'
import { DowngradeWarning } from './molecules/DowngradeWarning'
import { PlanCard } from './molecules/PlanCard'
import { PlanChangeForm } from './molecules/PlanChangeForm'
import { PlanChangeSummary } from './molecules/PlanChangeSummary'
import { PlanSwitchPreview } from './molecules/PlanSwitchPreview'

interface PlanChangeConfirmProps {
  planId: string
  changeType: ChangeType
  currentPlanName: string
  newPlanName: string
  currentDescription: string
  newDescription: string
  currentPrice: number
  newPrice: number
  renewsAtFormatted: string
  currentFeatures: PlanFeature[]
  newFeatures: PlanFeature[]
  lostFeatures: string[]
}

export function PlanChangeConfirm({
  planId,
  changeType,
  currentPlanName,
  newPlanName,
  currentDescription,
  newDescription,
  currentPrice,
  newPrice,
  renewsAtFormatted,
  currentFeatures,
  newFeatures,
  lostFeatures,
}: PlanChangeConfirmProps) {
  const t = useTranslations('checkout.planChange')
  const router = useRouter()
  const [state, formAction, pending] = useActionState<AccountActionState | null, FormData>(
    upgradeSubscriptionAction,
    null
  )

  useEffect(() => {
    if (state?.status === 'success') {
      router.push('/account/subscription')
    }
  }, [state, router])

  const isDowngrade = changeType === 'downgrade'
  const priceDiff = Math.abs(newPrice - currentPrice)

  return (
    <main className="min-h-screen bg-surface-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        {/* Back link */}
        <Link
          href="/pricing"
          className="inline-flex items-center text-sm text-fg-muted hover:text-fg transition-colors mb-8"
        >
          {t('backToPricing')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">

          {/* ── Left column ── */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-semibold text-fg">
                {isDowngrade
                  ? t('downgrade.title', { plan: newPlanName })
                  : t('upgrade.title', { plan: newPlanName })}
              </h1>
              <p className="mt-2 text-sm text-fg-muted leading-relaxed">
                {isDowngrade
                  ? t('downgrade.subtitle', { date: renewsAtFormatted, current: currentPlanName })
                  : t('upgrade.subtitle')}
              </p>
            </div>

            {/* Plan comparison */}
            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-widest mb-4">
                {t('comparisonTitle')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_32px_1fr] gap-3 items-start">
                <PlanCard
                  name={currentPlanName}
                  description={currentDescription}
                  price={currentPrice}
                  badge={t('currentPlan')}
                  features={currentFeatures}
                  variant="current"
                />
                <div className="hidden sm:flex items-center justify-center pt-20 text-xl text-fg-muted">
                  →
                </div>
                <div className="flex sm:hidden items-center justify-center py-1 text-xl text-fg-muted">
                  ↓
                </div>
                <PlanCard
                  name={newPlanName}
                  description={newDescription}
                  price={newPrice}
                  badge={t('newPlan')}
                  features={newFeatures}
                  variant="new"
                />
              </div>
            </div>

            {isDowngrade && lostFeatures.length > 0 && (
              <DowngradeWarning title={t('downgrade.warningTitle')} items={lostFeatures} />
            )}
          </div>

          {/* ── Right column — summary card ── */}
          <div className="lg:sticky lg:top-8">
            <div className="rounded-2xl bg-surface-elevated shadow-[0_0_20px_rgba(0,0,0,0.08)] p-6 space-y-5">

              <PlanSwitchPreview
                currentPlanName={currentPlanName}
                currentPrice={currentPrice}
                newPlanName={newPlanName}
                newPrice={newPrice}
                currentLabel={t('currentPlan')}
                newLabel={t('newPlan')}
              />

              <div className="h-px bg-line/40" />

              <PlanChangeSummary
                costLabel={isDowngrade ? t('downgrade.savingsLabel') : t('upgrade.costLabel')}
                costValue={isDowngrade ? `-€${priceDiff}/lună` : `+€${priceDiff}/lună`}
                effectiveLabel={isDowngrade ? t('downgrade.effectiveLabel') : t('upgrade.effectiveLabel')}
                effectiveValue={isDowngrade ? renewsAtFormatted : t('upgrade.effectiveValue')}
                note={isDowngrade ? t('downgrade.note') : t('upgrade.prorationNote')}
              />

              <div className="h-px bg-line/40" />

              <PlanChangeForm
                formAction={formAction}
                planId={planId}
                pending={pending}
                error={state?.status === 'error' ? state.message : undefined}
                isDowngrade={isDowngrade}
                ctaLabel={isDowngrade ? t('downgrade.cta') : t('upgrade.cta')}
                processingLabel={t('processing')}
                cancelLabel={t('cancel')}
                keepPlanLabel={isDowngrade ? t('downgrade.keepPlan', { plan: currentPlanName }) : undefined}
              />

              <p className="text-xs text-fg-muted text-center">{t('trust')}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
