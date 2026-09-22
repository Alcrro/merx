'use client'

import { useState, useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cancelSubscriptionAction, undoCancelSubscriptionAction } from '@/features/account/actions'
import type { AccountActionState } from '@/features/account/types'
import { SubscriptionCancellingBanner } from './SubscriptionCancellingBanner'
import { SubscriptionCancelConfirm } from './SubscriptionCancelConfirm'

interface SubscriptionActionsProps {
  cancelAtPeriodEnd: boolean
  renewsAt: number
}

export function SubscriptionActions({ cancelAtPeriodEnd, renewsAt }: SubscriptionActionsProps) {
  const t = useTranslations('account.subscription')
  const [cancelState, cancelAction, cancelPending] = useActionState<AccountActionState, FormData>(cancelSubscriptionAction, null)
  const [undoState, undoAction, undoPending] = useActionState<AccountActionState, FormData>(undoCancelSubscriptionAction, null)
  const [showConfirm, setShowConfirm] = useState(false)

  const fmtDate = new Date(renewsAt * 1000).toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const isCancelling = cancelAtPeriodEnd || cancelState?.status === 'success'

  if (isCancelling) {
    return (
      <SubscriptionCancellingBanner
        fmtDate={fmtDate}
        undoAction={undoAction}
        undoPending={undoPending}
        undoError={undoState?.status === 'error' ? undoState.message : null}
      />
    )
  }

  if (showConfirm) {
    return (
      <SubscriptionCancelConfirm
        fmtDate={fmtDate}
        cancelAction={cancelAction}
        cancelPending={cancelPending}
        cancelError={cancelState?.status === 'error' ? cancelState.message : null}
        onKeep={() => setShowConfirm(false)}
      />
    )
  }

  return (
    <div className="border-t border-line px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
      <Link
        href="/pricing"
        className="text-sm font-medium text-fg-muted hover:text-primary transition-colors"
      >
        {t('actions.changePlan')}
      </Link>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="text-xs text-fg-subtle hover:text-error transition-colors"
      >
        {t('cancel.link')}
      </button>
    </div>
  )
}
