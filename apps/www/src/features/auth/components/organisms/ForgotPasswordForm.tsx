'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { forgotPasswordAction } from '@/features/auth/actions'
import { Button } from '@/components/atoms/Button'
import { Field } from '@/components/atoms/Field'
import { FormAlert } from '@/components/atoms/FormAlert'

export function ForgotPasswordForm() {
  const t = useTranslations('auth')
  const tf = useTranslations('auth.forgotPassword')
  const [state, action, isPending] = useActionState(forgotPasswordAction, null)

  if (state?.status === 'success') {
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-5">
          <p className="text-sm font-medium text-success">{tf('successTitle')}</p>
          <p className="text-xs text-fg-muted mt-1">{tf('successMessage')}</p>
        </div>
        <Link href="/login" className="text-sm text-fg-muted hover:text-fg transition-colors">
          {tf('backToLogin')}
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <Field
        id="email"
        name="email"
        label={t('form.emailLabel')}
        type="email"
        autoComplete="email"
        required
        placeholder={t('form.emailPlaceholder')}
      />

      {state?.status === 'error' && (
        <FormAlert variant="error" message={t(`errors.${state.message}` as 'errors.serverError')} />
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200"
        size="lg"
        disabled={isPending}
      >
        {isPending ? tf('submitting') : tf('submit')}
      </Button>
    </form>
  )
}
