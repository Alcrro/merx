'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { signupAction } from '@/features/auth/actions'
import { Button } from '@/components/atoms/Button'
import { Field } from '@/components/atoms/Field'

export function SignupForm() {
  const t = useTranslations('auth')
  const tf = useTranslations('auth.form')
  const [state, action, isPending] = useActionState(signupAction, null)

  return (
    <form action={action} className="space-y-4">
      <Field id="name" name="name" label={tf('nameLabel')} type="text" autoComplete="name" required placeholder={tf('namePlaceholder')} />
      <Field id="email" name="email" label={tf('emailLabel')} type="email" autoComplete="email" required placeholder={tf('emailPlaceholder')} />
      <Field id="password" name="password" label={tf('passwordLabel')} type="password" autoComplete="new-password" required minLength={8} placeholder={tf('passwordPlaceholderSignup')} />

      {state?.message && (
        <div className="rounded-xl bg-error/10 border border-error/20 px-4 py-3">
          <p className="text-xs text-error">{t(`errors.${state.message}` as 'errors.emailExists')}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200"
        size="lg"
        disabled={isPending}
      >
        {isPending ? tf('signupSubmitting') : tf('signupSubmit')}
      </Button>
    </form>
  )
}
