'use client'

import { useActionState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { deleteAccountAction } from '@/features/account/actions'
import { FormAlert } from '@/components/atoms/FormAlert'
import { Button } from '@/components/atoms/Button'
import { Field } from '@/components/atoms/Field'

interface DeleteAccountModalProps {
  hasPassword: boolean
  onClose: () => void
}

export function DeleteAccountModal({ hasPassword, onClose }: DeleteAccountModalProps) {
  const t = useTranslations('account.profile')
  const [deleteState, deleteAction, isDeletePending] = useActionState(deleteAccountAction, null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        className="relative z-10 w-full max-w-md rounded-2xl bg-surface border border-line shadow-xl p-6 space-y-4"
      >
        <h2 id="delete-account-title" className="text-base font-semibold text-fg">{t('danger.modal.title')}</h2>
        <p className="text-sm text-fg-muted">{t('danger.modal.description')}</p>

        <form action={deleteAction} className="space-y-4">
          <Field
            id="delete-email"
            name="email"
            type="email"
            label={t('danger.modal.emailLabel')}
            placeholder={t('danger.modal.emailPlaceholder')}
            autoComplete="off"
            required
          />

          {hasPassword && (
            <Field
              id="delete-password"
              name="password"
              type="password"
              label={t('danger.modal.passwordLabel')}
              placeholder={t('danger.modal.passwordPlaceholder')}
              autoComplete="current-password"
              required
            />
          )}

          {deleteState?.status === 'error' && <FormAlert variant="error" message={deleteState.message} />}

          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('danger.modal.cancel')}
            </Button>
            <Button type="submit" variant="destructive" disabled={isDeletePending}>
              {t('danger.modal.confirm')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
