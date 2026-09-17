'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { revokeSessionAction } from '@/features/account/actions'
import { Button } from '@/components/atoms/Button'

interface RevokeSessionFormProps {
  tokenId: string
}

export function RevokeSessionForm({ tokenId }: RevokeSessionFormProps) {
  const t = useTranslations('account.security.sessions')
  const [, action, isPending] = useActionState(revokeSessionAction, null)

  return (
    <form action={action}>
      <input type="hidden" name="tokenId" value={tokenId} />
      <Button type="submit" variant="ghost" size="sm" disabled={isPending} className="text-xs">
        {t('revoke')}
      </Button>
    </form>
  )
}
