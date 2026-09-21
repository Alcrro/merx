'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { updateProfileAction } from '@/features/account/actions'
import { Field } from '@/components/atoms/Field'
import { FormAlert } from '@/components/atoms/FormAlert'
import { SelectField } from '@/components/atoms/SelectField'
import { Button } from '@/components/atoms/Button'

interface ProfileFormProps {
  name: string | null
  email: string
  preferredLocale: string
}

export function ProfileForm({ name, email, preferredLocale }: ProfileFormProps) {
  const t = useTranslations('account.profile')
  const tf = useTranslations('account.profile.fields')
  const [state, action, isPending] = useActionState(updateProfileAction, null)

  return (
    <form action={action} className="space-y-5">
      <Field
        id="name"
        name="name"
        label={tf('name')}
        type="text"
        defaultValue={name ?? ''}
        placeholder={tf('namePlaceholder')}
        required
        autoComplete="name"
      />

      <Field
        id="email"
        name="email"
        label={tf('email')}
        type="email"
        value={email}
        readOnly
        className="w-full rounded-xl bg-surface-subtle px-4 py-2.5 text-sm text-fg-muted cursor-not-allowed opacity-60 focus:outline-none"
      />

      <SelectField
        id="preferredLocale"
        name="preferredLocale"
        label={tf('language')}
        defaultValue={preferredLocale}
      >
        <option value="ro">{tf('languageRo')}</option>
        <option value="en">{tf('languageEn')}</option>
      </SelectField>

      {state?.status === 'error' && <FormAlert variant="error" message={state.message} />}
      {state?.status === 'success' && <FormAlert variant="success" message={state.message} />}

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={isPending}
        >
          {isPending ? t('saving') : t('save')}
        </Button>
      </div>
    </form>
  )
}
