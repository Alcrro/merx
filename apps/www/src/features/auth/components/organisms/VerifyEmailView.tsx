'use client'

import { useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { verifyEmailAction, resendVerificationAction } from '@/features/auth/actions'
import { Button } from '@/components/atoms/Button'
import type { AuthFormState } from '@/features/auth/types'

interface VerifyEmailViewProps {
  token: string
}

export function VerifyEmailView({ token }: VerifyEmailViewProps) {
  const t = useTranslations('auth')
  const tv = useTranslations('auth.verifyEmail')
  const [state, setState] = useState<AuthFormState | null>(null)
  const [isPending, startTransition] = useTransition()
  const [resendState, setResendState] = useState<AuthFormState | null>(null)
  const [isResending, startResend] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const result = await verifyEmailAction(token)
      setState(result)
    })
  }, [token])

  const handleResend = () => {
    startResend(async () => {
      const result = await resendVerificationAction()
      setResendState(result)
    })
  }

  if (isPending) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-fg-muted">{tv('verifyingTitle')}</p>
      </div>
    )
  }

  if (state?.status === 'success') {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-5">
          <p className="text-sm font-medium text-success">{tv('successTitle')}</p>
          <p className="text-xs text-fg-muted mt-1">{tv('successMessage')}</p>
        </div>
        <Link href="/account">
          <Button
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200"
            size="lg"
          >
            {tv('goToAccount')}
          </Button>
        </Link>
      </div>
    )
  }

  if (state?.status === 'error') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-error/10 border border-error/20 px-4 py-5 text-center">
          <p className="text-sm font-medium text-error">{tv('errorTitle')}</p>
          <p className="text-xs text-fg-muted mt-1">{tv('errorMessage')}</p>
        </div>

        {resendState?.status === 'success' ? (
          <p className="text-center text-xs text-success">{tv('resendSuccess')}</p>
        ) : (
          <Button variant="outline" size="lg" className="w-full" onClick={handleResend} disabled={isResending}>
            {isResending ? tv('resending') : tv('resend')}
          </Button>
        )}

        {resendState?.status === 'error' && (
          <p className="text-center text-xs text-error">
            {t(`errors.${resendState.message}` as 'errors.serverError')}
          </p>
        )}

        <div className="text-center">
          <Link href="/login" className="text-sm text-fg-muted hover:text-fg transition-colors">
            {tv('backToLogin')}
          </Link>
        </div>
      </div>
    )
  }

  return null
}
