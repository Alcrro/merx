'use client'

import { useRef, useActionState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { uploadAvatarAction, removeAvatarAction } from '@/features/account/actions'
import { getInitials } from '@/lib/utils'

interface AvatarUploadProps {
  avatarUrl: string | null
  name: string | null
  email: string
}

export function AvatarUpload({ avatarUrl, name, email }: AvatarUploadProps) {
  const t = useTranslations('account.profile.avatar')
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadFormRef = useRef<HTMLFormElement>(null)

  const [uploadState, uploadAction, isUploading] = useActionState(uploadAvatarAction, null)
  const [removeState, removeAction, isRemoving] = useActionState(removeAvatarAction, null)
  const [, startTransition] = useTransition()

  const initials = getInitials(name ?? email)
  const isPending = isUploading || isRemoving
  const error = uploadState?.status === 'error' ? uploadState.message : removeState?.status === 'error' ? removeState.message : null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    startTransition(() => {
      uploadFormRef.current?.requestSubmit()
    })
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-24 h-24 rounded-2xl object-cover border border-line"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-primary-subtle text-primary text-2xl font-bold flex items-center justify-center select-none">
            {initials}
          </div>
        )}
        {isPending && (
          <div className="absolute inset-0 rounded-2xl bg-surface/70 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="space-y-1 flex flex-col items-center">
        <form ref={uploadFormRef} action={uploadAction}>
          <input
            ref={inputRef}
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
            className="block text-xs font-medium text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('change')}
          </button>
        </form>

        {avatarUrl && (
          <form action={(fd) => startTransition(() => removeAction(fd))}>
            <button
              type="submit"
              disabled={isPending}
              className="block text-xs font-medium text-error hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('remove')}
            </button>
          </form>
        )}

        <p className="text-xs text-fg-subtle pt-0.5">{t('hint')}</p>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    </div>
  )
}
