import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { SignupForm } from '@/features/auth/components/organisms/SignupForm'
import { OAuthButton } from '@/features/auth/components/molecules/OAuthButton'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.metadata')
  return { title: t('signupTitle'), robots: { index: false } }
}

export default async function SignupPage() {
  const t = await getTranslations('auth.signup')

  return (
    <div className="w-full max-w-[380px]">
      <h1 className="text-2xl font-bold text-fg mb-1">{t('title')}</h1>
      <p className="mt-1.5 text-sm text-fg-muted mb-8">
        {t('trial')}{' '}
        <Link href="/login" className="text-primary font-medium hover:underline underline-offset-2">
          {t('hasAccount')}
        </Link>
      </p>

      <OAuthButton />

      <SignupForm />

      <p className="mt-5 text-center text-[11px] text-fg-subtle leading-relaxed">
        {t('terms')}{' '}
        <Link href="/terms" className="underline underline-offset-2 hover:text-fg-muted">{t('termsLink')}</Link>
        {' '}{t('and')}{' '}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-fg-muted">{t('privacyLink')}</Link>.
      </p>
    </div>
  )
}
