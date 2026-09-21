'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { resendVerificationAction } from '@/features/auth/actions'

export function EmailVerificationBanner() {
  const t = useTranslations('account.emailVerification')
  const [sent, setSent] = useState(false)
  const [failed, setFailed] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleResend = () => {
    setFailed(false)
    startTransition(async () => {
      const result = await resendVerificationAction()
      if (result.status === 'success') setSent(true)
      else setFailed(true)
    })
  }

  return (
    <div className="border-b border-warning/30 bg-warning/5 px-4 py-2 flex items-center justify-center gap-3 text-xs text-warning">
      <span>{sent ? t('resent') : failed ? t('resendFailed') : t('banner')}</span>
      {!sent && (
        <button
          onClick={handleResend}
          disabled={isPending}
          className="font-semibold underline underline-offset-2 hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {isPending ? t('resending') : t('resend')}
        </button>
      )}
    </div>
  )
}
