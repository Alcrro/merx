import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getTrialDaysLeft } from '@/services/account'

interface CurrentPlanCardProps {
  planStatus: string
  trialEndsAt: Date
}

export async function CurrentPlanCard({ planStatus, trialEndsAt }: CurrentPlanCardProps) {
  const t = await getTranslations('account.subscription.currentPlan')
  const daysLeft = getTrialDaysLeft(trialEndsAt)

  if (planStatus === 'trial') {
    const isExpired = daysLeft === 0
    return (
      <div className={`rounded-2xl border p-4 sm:p-6 ${isExpired ? 'border-error/30 bg-error/5' : 'border-line bg-surface-elevated shadow-md dark:shadow-none'}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted mb-1">{t('trial')}</p>
            {isExpired ? (
              <p className="text-sm font-semibold text-error">{t('expired')}</p>
            ) : (
              <p className="text-2xl font-bold text-fg">
                {t('daysLeft', { days: daysLeft })}
              </p>
            )}
            <p className="text-xs text-fg-muted mt-1">{t('limits')}</p>
          </div>
          <Link
            href="/account/subscription"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Upgrade →
          </Link>
        </div>
      </div>
    )
  }

  if (planStatus === 'active') {
    return (
      <div className="rounded-2xl border border-line bg-surface-elevated p-4 sm:p-6 shadow-md dark:shadow-none">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted mb-1">Plan activ</p>
            <p className="text-2xl font-bold text-fg capitalize">{planStatus}</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-success/10 border border-success/20 px-3 py-1 text-xs font-semibold text-success">
            Activ
          </span>
        </div>
      </div>
    )
  }

  return null
}
