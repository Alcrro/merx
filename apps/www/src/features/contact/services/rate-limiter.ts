import { cookies } from 'next/headers'
import { RateLimitError } from '@/errors/rate-limit.error'
import { config } from '@/config'

const COOKIE = 'merx_contact_rl'

export async function checkRateLimit(): Promise<void> {
  const cookieStore = await cookies()
  if (cookieStore.has(COOKIE)) throw new RateLimitError()
}

export async function markRateLimited(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE, '1', {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  })
}
