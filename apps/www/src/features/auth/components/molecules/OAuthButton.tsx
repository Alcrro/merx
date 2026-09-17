import { getTranslations } from 'next-intl/server'
import { GoogleIcon } from '@/components/atoms/GoogleIcon'

export async function OAuthButton() {
  const t = await getTranslations('auth.form')

  return (
    <>
      <a
        href="/api/auth/google"
        className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-surface-subtle px-4 py-3 text-sm font-medium text-fg hover:bg-surface-elevated transition-all duration-200 ring-1 ring-stroke hover:ring-stroke-strong hover:shadow-sm"
      >
        <GoogleIcon />
        {t('continueGoogle')}
      </a>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-stroke" />
        <span className="text-xs text-fg-subtle">{t('or')}</span>
        <div className="h-px flex-1 bg-stroke" />
      </div>
    </>
  )
}
