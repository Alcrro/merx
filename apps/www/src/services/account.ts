import { cache } from 'react'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

export interface AccountUser {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
  preferredLocale: string
  planStatus: string
  planId: string | null
  trialEndsAt: Date
  password: string | null
  authProvider: string
  googleId: string | null
  emailVerified: boolean
  lastDataExportAt: Date | null
}

export const getAccountUser = cache(async (): Promise<AccountUser | null> => {
  const cookieStore = await cookies()
  const raw = cookieStore.get('merx_www_user')?.value
  if (!raw) return null

  let email: string
  try {
    email = (JSON.parse(raw) as { email: string }).email
  } catch {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      preferredLocale: true,
      planStatus: true,
      planId: true,
      trialEndsAt: true,
      password: true,
      authProvider: true,
      googleId: true,
      emailVerified: true,
      lastDataExportAt: true,
    },
  })

  if (!user) return null

  return {
    ...user,
    planStatus: user.planStatus as string,
  }
})

export function getTrialDaysLeft(trialEndsAt: Date): number {
  return Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
}
