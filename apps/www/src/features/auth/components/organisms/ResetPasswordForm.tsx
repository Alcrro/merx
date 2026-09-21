'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { resetPasswordAction } from '@/features/auth/actions'
import { Button } from '@/components/atoms/Button'
import { Field } from '@/components/atoms/Field'
import { FormAlert } from '@/components/atoms/FormAlert'

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations('auth')
  const tf = useTranslations('auth.resetPassword')
  const [state, action, isPending] = useActionState(resetPasswordAction, null)

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <Field
        id="password"
        name="password"
        label={tf('newPasswordLabel')}
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={64}
        placeholder={tf('newPasswordPlaceholder')}
      />

      {state?.status === 'error' && (
        <FormAlert variant="error" message={t(`errors.${state.message}` as 'errors.invalidToken')} />
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
