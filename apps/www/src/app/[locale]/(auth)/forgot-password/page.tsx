import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ForgotPasswordForm } from '@/features/auth/components/organisms/ForgotPasswordForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.metadata')
  return { title: t('forgotPasswordTitle'), robots: { index: false } }
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations('auth.forgotPassword')

  return (
    <div className="w-full max-w-[380px]">
      <h1 className="text-2xl font-bold text-fg mb-1">{t('title')}</h1>
      <p className="text-sm text-fg-muted mb-8">{t('description')}</p>

      <ForgotPasswordForm />

      <div className="mt-4 text-center">
        <Link href="/login" className="text-xs text-fg-subtle hover:text-fg-muted transition-colors">
          {t('backToLogin')}
        </Link>
      </div>
    </div>
  )
}
