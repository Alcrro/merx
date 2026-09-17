'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { loginAction } from '@/features/auth/actions'
import { Button } from '@/components/atoms/Button'
import { Field } from '@/components/atoms/Field'

interface SavedUser {
  name: string | null
  email: string
  avatarUrl: string | null
}

interface LoginFormProps {
  savedUser?: SavedUser | null
}

export function LoginForm({ savedUser }: LoginFormProps) {
  const t = useTranslations('auth')
  const tf = useTranslations('auth.form')
  const [state, action, isPending] = useActionState(loginAction, null)
  const [useSaved, setUseSaved] = useState(!!savedUser)

  const initial = savedUser ? (savedUser.name ?? savedUser.email)[0].toUpperCase() : ''

  return (
    <form action={action} className="space-y-4">
      {useSaved && savedUser ? (
        <>
          <input type="hidden" name="email" value={savedUser.email} />

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-subtle border border-line">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-primary">{initial}</span>
            </div>
            <div className="min-w-0">
              {savedUser.name && (
                <p className="text-sm font-medium text-fg leading-tight truncate">{savedUser.name}</p>
              )}
              <p className="text-xs text-fg-muted truncate">{savedUser.email}</p>
            </div>
          </div>

          <Field
            id="password"
            name="password"
            label={tf('passwordLabel')}
            type="password"
            autoComplete="current-password"
            required
            placeholder={tf('passwordPlaceholderLogin')}
          />
        </>
      ) : (
        <>
          <Field id="email" name="email" label={tf('emailLabel')} type="email" autoComplete="email" required placeholder={tf('emailPlaceholder')} />
          <Field id="password" name="password" label={tf('passwordLabel')} type="password" autoComplete="current-password" required placeholder={tf('passwordPlaceholderLogin')} />
        </>
      )}

      {state?.message && (
        <div className="rounded-xl bg-error/10 border border-error/20 px-4 py-3">
          <p className="text-xs text-error">{t(`errors.${state.message}` as 'errors.invalidCredentials')}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200"
        size="lg"
        disabled={isPending}
      >
        {isPending ? tf('loginSubmitting') : tf('loginSubmit')}
      </Button>

      {useSaved && savedUser && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setUseSaved(false)}
            className="text-xs text-fg-subtle hover:text-fg-muted transition-colors"
          >
            {tf('notYou')}
          </button>
        </div>
      )}
    </form>
  )
}
