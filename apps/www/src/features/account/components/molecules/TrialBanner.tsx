import { getTranslations } from 'next-intl/server'
import { cn } from '@/lib/utils'
import { Link } from '@/i18n/navigation'
import { getTrialDaysLeft } from '@/services/account'
import { TRIAL_STATUS_CLS } from '../styles/trialBanner.styles'

interface TrialBannerProps {
  planStatus: string
  trialEndsAt: Date
}

export async function TrialBanner({ planStatus, trialEndsAt }: TrialBannerProps) {
  if (planStatus === 'active' || planStatus === 'cancelled') return null

  const t = await getTranslations('account.trial')
  const days = getTrialDaysLeft(trialEndsAt)

  const isExpired = planStatus === 'expired' || days === 0
  const statusCls = isExpired ? TRIAL_STATUS_CLS.expired
    : days === 1             ? TRIAL_STATUS_CLS.urgent
    : days <= 3              ? TRIAL_STATUS_CLS.warning
    :                          TRIAL_STATUS_CLS.active

  const message = isExpired  ? t('expired')
    : days === 1             ? t('urgent')
    : days <= 3              ? t('warning', { days })
    :                          t('active', { days })

  return (
    <div className={cn('border-b px-4 py-2 text-center text-xs font-medium', statusCls)}>
      <Link href="/account/subscription" className="hover:underline">
        {message}
      </Link>
    </div>
  )
}
