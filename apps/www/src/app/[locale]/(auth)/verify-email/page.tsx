import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { VerifyEmailView } from '@/features/auth/components/organisms/VerifyEmailView'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.metadata')
  return { title: t('verifyEmailTitle'), robots: { index: false } }
}

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
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

  return (
    <div className="w-full max-w-[380px]">
      <VerifyEmailView token={token} />
    </div>
  )
}
