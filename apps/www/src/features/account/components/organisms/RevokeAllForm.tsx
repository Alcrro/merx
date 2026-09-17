'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { revokeAllOtherSessionsAction } from '@/features/account/actions'
import { Button } from '@/components/atoms/Button'

export function RevokeAllForm() {
  const t = useTranslations('account.security.sessions')
  const [state, action, isPending] = useActionState(revokeAllOtherSessionsAction, null)

  return (
    <form action={action} className="flex items-center gap-3">
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {t('revokeAll')}
      </Button>
      {state?.status === 'success' && (
        <span className="text-xs text-success">{state.message}</span>
      )}
    </form>
  )
}
