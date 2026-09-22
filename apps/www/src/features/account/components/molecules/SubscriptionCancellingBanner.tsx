'use client'

import { useTranslations } from 'next-intl'

interface SubscriptionCancellingBannerProps {
  fmtDate: string
  undoAction: (payload: FormData) => void
  undoPending: boolean
  undoError?: string | null
}

export function SubscriptionCancellingBanner({ fmtDate, undoAction, undoPending, undoError }: SubscriptionCancellingBannerProps) {
  const t = useTranslations('account.subscription.actions')

  return (
    <div className="border-t border-line px-4 sm:px-6 py-4">
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          {t('cancellingOn', { date: fmtDate })}
        </p>
        <form action={undoAction}>
          <button
            type="submit"
            disabled={undoPending}
            className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline disabled:opacity-50"
          >
            {undoPending ? t('processing') : t('undoCancel')}
          </button>
        </form>
      </div>
      {undoError && (
        <p className="text-xs text-error mt-2">{undoError}</p>
      )}
    </div>
  )
}
