import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ResetPasswordForm } from '@/features/auth/components/organisms/ResetPasswordForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.metadata')
  return { title: t('resetPasswordTitle'), robots: { index: false } }
}

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams

  if (!token) {
    const te = await getTranslations('auth.errors')
    return (
      <div className="w-full max-w-[380px] text-center">
        <div className="rounded-xl bg-error/10 border border-error/20 px-4 py-5">
          <p className="text-sm text-error">{te('invalidToken')}</p>
        </div>
      </div>
    )
  }

  const t = await getTranslations('auth.resetPassword')

  return (
    <div className="w-full max-w-[380px]">
      <h1 className="text-2xl font-bold text-fg mb-1">{t('title')}</h1>
      <p className="text-sm text-fg-muted mb-8">{t('description')}</p>
      <ResetPasswordForm token={token} />
    </div>
  )
}
