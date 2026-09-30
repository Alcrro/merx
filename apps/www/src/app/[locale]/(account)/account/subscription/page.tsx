import { redirect } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import { PLAN_CONFIG } from '@merx/types'
import { getAccountUser } from '@/services/account'
import { getAccessToken, getActiveSubscriptionApi } from '@/features/account/services/billing.api'
import { CurrentPlanCard } from '@/features/account/components/organisms/CurrentPlanCard'
import { SubscriptionPlanCard } from '@/features/account/components/organisms/SubscriptionPlanCard'
import { SubscriptionActions } from '@/features/account/components/molecules/SubscriptionActions'

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const user = await getAccountUser()
  if (!user) redirect('/login')

  const t = await getTranslations('account.subscription')
  const tp = await getTranslations('pricing.plans')
  const locale = await getLocale()
  const params = await searchParams

  const isActive = user.planStatus === 'active'

  const accessToken = isActive ? await getAccessToken() : null
  const activeSub = accessToken ? await getActiveSubscriptionApi(accessToken) : null

  const allPlans = Object.values(PLAN_CONFIG).filter((p) => p.id !== 'enterprise')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-fg">{t('title')}</h1>
        <p className="text-sm text-fg-muted mt-1">{t('subtitle')}</p>
      </div>

      {params.success && (
        <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3">
          <p className="text-sm text-success font-medium">{t('activePlan.success')}</p>
        </div>
      )}

      {params.error === 'plan-not-configured' && (
        <div className="rounded-xl bg-error/10 border border-error/20 px-4 py-3">
          <p className="text-sm text-error">{t('activePlan.errorPlanNotConfigured')}</p>
        </div>
      )}

      {isActive && activeSub ? (() => {
        const fmt = (ts: number) => {
          if (!ts || isNaN(ts)) return null
          return new Date(ts * 1000).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
        }
        const hasDates = Boolean(activeSub.startsAt && activeSub.renewsAt)
        const totalDays = hasDates ? Math.ceil((activeSub.renewsAt - activeSub.startsAt) / (60 * 60 * 24)) : 0
        const daysLeft = hasDates ? Math.max(0, Math.ceil((activeSub.renewsAt * 1000 - Date.now()) / (1000 * 60 * 60 * 24))) : 0
        const progress = hasDates && totalDays > 0 ? Math.round(((totalDays - daysLeft) / totalDays) * 100) : 0
        const price = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: activeSub.currency.toUpperCase(),
        }).format(activeSub.priceAmount / 100)

        return (
          <div className="rounded-2xl border border-line bg-white dark:bg-surface-elevated shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-none overflow-hidden">
            <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-base font-semibold text-fg">{activeSub.planName}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    {t('activePlan.badge')}
                  </span>
                </div>
                <p className="text-sm text-fg-muted">{price}/{activeSub.interval}</p>
              </div>
            </div>

            {hasDates ? (
              <div className="px-4 sm:px-6 pb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-fg-subtle">{fmt(activeSub.startsAt)}</span>
                  <span className="text-xs font-medium text-fg-muted">
                    {t('activePlan.daysRemaining', { days: daysLeft })}
                  </span>
                  <span className="text-xs text-fg-subtle">{fmt(activeSub.renewsAt)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface-subtle overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-fg-subtle mt-2 text-center">
                  {activeSub.cancelAtPeriodEnd
                    ? t('activePlan.expires', { date: fmt(activeSub.renewsAt) ?? '' })
                    : t('activePlan.renews', { date: fmt(activeSub.renewsAt) ?? '' })}
                </p>
              </div>
            ) : (
              <div className="px-4 sm:px-6 pb-5 border-t border-line/50">
                <p className="text-xs text-fg-subtle text-center py-3">
                  {t('activePlan.periodUnavailable')}
                </p>
              </div>
            )}

            <SubscriptionActions
              cancelAtPeriodEnd={activeSub.cancelAtPeriodEnd}
              renewsAt={activeSub.renewsAt}
            />
          </div>
        )
      })() : (
        <CurrentPlanCard planStatus={user.planStatus} trialEndsAt={user.trialEndsAt} />
      )}

      {!isActive && (
        <div>
          <h2 className="text-base font-semibold text-fg mb-5">{t('upgrade.title')}</h2>
          <div className="grid gap-4 sm:grid-cols-3 mt-6">
            {allPlans.map((plan) => {
              const planT = tp.raw(plan.id as 'starter' | 'pro' | 'scale') as {
                description: string
                features: { label: string; value: string }[]
              }
              return (
                <SubscriptionPlanCard
                  key={plan.id}
                  id={plan.id}
                  name={plan.name}
                  price={plan.price}
                  description={planT.description}
                  features={planT.features}
                  isHighlighted={plan.highlight}
                  isCurrent={false}
                  mode="checkout"
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
