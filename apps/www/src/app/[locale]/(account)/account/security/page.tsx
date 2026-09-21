import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { getAccountUser } from '@/services/account'
import { prisma } from '@/services/prisma'
import { PasswordForm } from '@/features/account/components/organisms/PasswordForm'
import { SessionsList } from '@/features/account/components/organisms/SessionsList'

export default async function SecurityPage() {
  const user = await getAccountUser()
  if (!user) redirect('/login')

  const t = await getTranslations('account.security')

  const cookieStore = await cookies()
  const rawCurrentToken = cookieStore.get('merx_www_refresh')?.value ?? null
  const currentHash = rawCurrentToken
    ? crypto.createHash('sha256').update(rawCurrentToken).digest('hex')
    : null

  const rawTokens = await prisma.refreshToken.findMany({
    where: {
      userId: user.id,
      used: false,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, token: true, createdAt: true, userAgent: true, ip: true },
    orderBy: { createdAt: 'desc' },
  })

  const sessions = rawTokens.map((rt) => ({
    id: rt.id,
    createdAt: rt.createdAt,
    isCurrent: currentHash !== null && rt.token === currentHash,
    userAgent: rt.userAgent,
    ip: rt.ip,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-fg">{t('title')}</h1>
        <p className="text-sm text-fg-muted mt-1">{t('subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:flex-1 lg:min-w-0">
          <PasswordForm hasPassword={user.password !== null} />
        </div>
        <div className="w-full lg:w-80 lg:shrink-0">
          <SessionsList sessions={sessions} />
        </div>
      </div>
    </div>
  )
}
