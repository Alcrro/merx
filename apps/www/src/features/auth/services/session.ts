import { cookies } from 'next/headers'
import crypto from 'crypto'
import { prisma } from '@/services/prisma'
import { config } from '@/config'

export interface SessionUser {
  name?: string | null
  email: string
  avatarUrl?: string | null
}

export interface AuthSuccessResponse {
  refreshToken: string
  platformToken: string
  user: SessionUser
}

const SECURE_COOKIE = {
  httpOnly: true,
  secure: config.isProd,
  sameSite: 'lax' as const,
  path: '/',
}

const DISPLAY_COOKIE = {
  secure: config.isProd,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
}

export async function setSessionCookies(
  refreshToken: string,
  platformToken: string,
  user: SessionUser
) {
  const cookieStore = await cookies()
  cookieStore.set('merx_www_refresh', refreshToken, { ...SECURE_COOKIE, maxAge: 60 * 60 * 24 * 30 })
  cookieStore.set('merx_www_access', platformToken, { ...SECURE_COOKIE, maxAge: 60 * 5 })
  cookieStore.set(
    'merx_www_user',
    JSON.stringify({
      name: user.name ?? null,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
    }),
    DISPLAY_COOKIE
  )
}

export async function revokeCurrentSession() {
  const cookieStore = await cookies()
  const raw = cookieStore.get('merx_www_refresh')?.value
  if (!raw) return
  const hash = crypto.createHash('sha256').update(raw).digest('hex')
  await prisma.refreshToken.deleteMany({ where: { token: hash } })
}

export async function clearSessionCookies() {
  await revokeCurrentSession()
  const cookieStore = await cookies()
  cookieStore.delete('merx_www_refresh')
  cookieStore.delete('merx_www_access')
  cookieStore.delete('merx_www_user')
}
