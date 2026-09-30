import crypto from 'crypto'
import type { NextRequest, NextResponse } from 'next/server'
import { config } from '@/config'

const STATE_COOKIE = 'merx_www_oauth_state'
const STATE_COOKIE_PATH = '/api/auth/google/callback'
const STATE_TTL_SECONDS = 60 * 10

export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function setOAuthStateCookie(res: NextResponse, state: string): void {
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'lax',
    path: STATE_COOKIE_PATH,
    maxAge: STATE_TTL_SECONDS,
  })
}

export function clearOAuthStateCookie(res: NextResponse): void {
  res.cookies.set(STATE_COOKIE, '', { path: STATE_COOKIE_PATH, maxAge: 0 })
}

// Constant-time comparison of the `state` query param against the cookie set before redirecting to Google.
export function isValidOAuthState(req: NextRequest): boolean {
  const expected = req.cookies.get(STATE_COOKIE)?.value
  const received = req.nextUrl.searchParams.get('state')
  if (!expected || !received) return false

  const a = Buffer.from(expected)
  const b = Buffer.from(received)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
