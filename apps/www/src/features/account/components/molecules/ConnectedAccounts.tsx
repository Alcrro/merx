'use client'

import { useActionState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { GoogleIcon } from '@/components/atoms/GoogleIcon'
import { EmailIcon } from '../atoms/EmailIcon'
import { SectionCard } from './SectionCard'
import { unlinkGoogleAction } from '@/features/account/actions'

interface ConnectedAccountsProps {
  hasPassword: boolean
  hasGoogle: boolean
}

export function ConnectedAccounts({ hasPassword, hasGoogle }: ConnectedAccountsProps) {
  const t = useTranslations('account.security.connected')
  const [state, formAction] = useActionState(unlinkGoogleAction, null)
  const [isPending, startTransition] = useTransition()

  return (
    <SectionCard title={t('title')} className="h-full">
      <div className="px-4 py-4 space-y-2">
        <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3">
          <div className="flex items-center gap-3">
            <EmailIcon />
            <span className="text-sm text-fg">{t('email')}</span>
          </div>
          {hasPassword ? (
            <span className="text-xs font-medium text-success bg-success/10 px-2.5 py-0.5 rounded-full">
              {t('linked')}
            </span>
          ) : (
            <span className="text-xs text-fg-subtle">—</span>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl bg-surface-subtle px-4 py-3">
          <div className="flex items-center gap-3">
            <GoogleIcon />
            <span className="text-sm text-fg">{t('google')}</span>
          </div>
          {hasGoogle ? (
            <form action={(fd) => startTransition(() => formAction(fd))}>
              <button
                type="submit"
                disabled={!hasPassword || isPending}
                title={!hasPassword ? t('unlinkDisabled') : undefined}
                className="text-xs font-medium text-error hover:underline disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
              >
                {isPending ? '…' : t('unlink')}
              </button>
            </form>
          ) : (
            <span className="text-xs text-fg-subtle">—</span>
          )}
        </div>

        {state?.status === 'error' && (
          <p className="text-xs text-error px-1">{state.message}</p>
        )}
      </div>
    </SectionCard>
  )
}
