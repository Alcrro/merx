'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { createCheckoutAction, upgradeSubscriptionAction } from '@/features/account/actions'
import type { AccountActionState } from '@/features/account/types'

interface SubscriptionPlanCtaProps {
  id: string
  name: string
  isCurrent: boolean
  isEnterprise: boolean
  isHighlighted: boolean
  mode: 'checkout' | 'switch'
}

export function SubscriptionPlanCta({ id, name, isCurrent, isEnterprise, isHighlighted, mode }: SubscriptionPlanCtaProps) {
  const t = useTranslations('account.subscription.upgrade')
  const tc = useTranslations('pricing.card')
  const [switchState, switchAction, switchPending] = useActionState<AccountActionState | null, FormData>(upgradeSubscriptionAction, null)

  if (isCurrent) {
    return (
      <div className={`w-full text-center rounded-xl px-4 py-3 text-sm font-semibold ${isHighlighted ? 'bg-white/20 text-white' : 'bg-surface-subtle text-fg-muted'}`}>
        {t('current')}
      </div>
    )
  }

  if (isEnterprise) {
    return (
      <a
        href="mailto:hello@merx.com"
        className="block w-full text-center rounded-xl px-4 py-3 text-sm font-semibold border border-line text-fg-muted hover:bg-surface transition-colors"
      >
        {tc('contactUs')}
      </a>
    )
  }

  if (mode === 'switch') {
    return (
      <>
        <form action={switchAction}>
          <input type="hidden" name="planId" value={id} />
          <button
            type="submit"
            disabled={switchPending}
            className={`w-full text-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
              isHighlighted
                ? 'bg-white text-primary hover:bg-primary-subtle'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            {switchPending ? 'Se procesează...' : `Treci la ${name}`}
          </button>
        </form>
        {switchState && (
          <p className={`text-xs mt-2 text-center ${switchState.status === 'error' ? 'text-error' : 'text-success'}`}>
            {switchState.message}
          </p>
        )}
      </>
    )
  }

  return (
    <form action={createCheckoutAction}>
      <input type="hidden" name="planId" value={id} />
      <button
        type="submit"
        className={`w-full text-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
          isHighlighted
            ? 'bg-white text-primary hover:bg-primary-subtle'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
      >
        {t('cta')}
      </button>
    </form>
  )
}
