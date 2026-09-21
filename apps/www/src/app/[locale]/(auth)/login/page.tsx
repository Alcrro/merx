import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { LoginForm } from '@/features/auth/components/organisms/LoginForm'
import { OAuthButton } from '@/features/auth/components/molecules/OAuthButton'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.metadata')
  return { title: t('loginTitle'), robots: { index: false } }
}

interface SavedUser {
  name: string | null
  email: string
  avatarUrl: string | null
}

export default async function LoginPage() {
  const t = await getTranslations('auth.login')

  const cookieStore = await cookies()
  const raw = cookieStore.get('merx_www_user')?.value
  let savedUser: SavedUser | null = null
  try {
    if (raw) savedUser = JSON.parse(raw) as SavedUser
  } catch {}

  return (
    <div className="w-full max-w-[380px]">
      <h1 className="text-2xl font-bold text-fg mb-1">
        {savedUser ? t('welcomeBack') : t('title')}
      </h1>
      <p className="text-sm text-fg-muted mb-8">
        {savedUser ? (
          t('continuePrompt')
        ) : (
          <>
            {t('noAccount')}{' '}
            <Link href="/signup" className="text-primary font-medium hover:underline underline-offset-2">
              {t('registerFree')}
            </Link>
          </>
        )}
      </p>

      {!savedUser && <OAuthButton />}

      <LoginForm savedUser={savedUser} />

      <div className="mt-4 text-center">
        <Link href="/forgot-password" className="text-xs text-fg-subtle hover:text-fg-muted transition-colors">
          {t('forgotPassword')}
        </Link>
      </div>
    </div>
  )
}
