'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { changePasswordAction, setPasswordAction } from '@/features/account/actions'
import { Field } from '@/components/atoms/Field'
import { FormAlert } from '@/components/atoms/FormAlert'
import { Button } from '@/components/atoms/Button'
import { SectionCard } from '../molecules/SectionCard'

interface PasswordFormProps {
  hasPassword: boolean
}

export function PasswordForm({ hasPassword }: PasswordFormProps) {
  const t = useTranslations('account.security.password')
  const action = hasPassword ? changePasswordAction : setPasswordAction
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <SectionCard
      title={t('title')}
      description={hasPassword ? t('hasPassword') : t('noPassword')}
    >
      <form action={formAction} className="px-4 sm:px-6 py-5 space-y-4">
        {hasPassword && (
          <Field
            id="currentPassword"
            name="currentPassword"
            type="password"
            label={t('current')}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        )}

        <Field
          id="newPassword"
          name="newPassword"
          type="password"
          label={t('new')}
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />

        <Field
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label={t('confirm')}
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />

        <p className="text-xs text-fg-subtle">{t('hint')}</p>

        {state?.status === 'error' && <FormAlert variant="error" message={state.message} />}
        {state?.status === 'success' && <FormAlert variant="success" message={state.message} />}

        <div className="pt-1">
          <Button type="submit" disabled={isPending}>
            {isPending ? t('saving') : hasPassword ? t('save') : t('set')}
          </Button>
        </div>
      </form>
    </SectionCard>
  )
}
