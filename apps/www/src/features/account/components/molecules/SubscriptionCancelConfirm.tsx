'use client'

import { useTranslations } from 'next-intl'

interface SubscriptionCancelConfirmProps {
  fmtDate: string
  cancelAction: (payload: FormData) => void
  cancelPending: boolean
  cancelError?: string | null
  onKeep: () => void
}

export function SubscriptionCancelConfirm({ fmtDate, cancelAction, cancelPending, cancelError, onKeep }: SubscriptionCancelConfirmProps) {
  const t = useTranslations('account.subscription.actions')

  return (
    <div className="border-t border-line px-4 sm:px-6 py-4">
      <div className="rounded-xl bg-error/5 border border-error/20 px-4 py-4">
        <p className="text-sm font-medium text-fg mb-1">{t('confirmTitle')}</p>
        <p className="text-xs text-fg-muted mb-4">{t('confirmDescription', { date: fmtDate })}</p>
        <div className="flex items-center gap-2">
          <form action={cancelAction}>
            <button
              type="submit"
              disabled={cancelPending}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-error text-white text-sm font-medium hover:bg-error/90 disabled:opacity-50 transition-colors"
            >
              {cancelPending ? t('processing') : t('confirmYes')}
            </button>
          </form>
          <button
            type="button"
            onClick={onKeep}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-line text-sm text-fg-muted hover:text-fg transition-colors"
          >
            {t('keepPlan')}
          </button>
        </div>
        {cancelError && (
          <p className="text-xs text-error mt-2">{cancelError}</p>
        )}
      </div>
    </div>
  )
}
