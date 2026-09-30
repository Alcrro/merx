import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { googleSignInApi } from '@/features/auth/services/auth.api'
import { clearOAuthStateCookie, isValidOAuthState } from '@/lib/auth/oauth-state'
import { config } from '@/config'

function redirectWithStateCleared(url: string): NextResponse {
  const res = NextResponse.redirect(url)
  clearOAuthStateCookie(res)
  return res
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')

  if (error || !code) return redirectWithStateCleared(`${config.urls.www}/login?error=oauth_cancelled`)

  // Login CSRF: only accept a callback that belongs to a flow started from this browser.
  if (!isValidOAuthState(req)) return redirectWithStateCleared(`${config.urls.www}/login?error=oauth_failed`)

  try {
    const meta = {
      userAgent: req.headers.get('user-agent') ?? undefined,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? undefined,
    }
    const { platformToken, refreshToken, user } = await googleSignInApi(code, meta)

    const secureCookie = { httpOnly: true, secure: config.isProd, sameSite: 'lax' as const, path: '/' }

    const res = redirectWithStateCleared(`${config.urls.www}/account`)
    res.cookies.set('merx_www_refresh', refreshToken, { ...secureCookie, maxAge: 60 * 60 * 24 * 30 })
    res.cookies.set('merx_www_access', platformToken, { ...secureCookie, maxAge: 60 * 5 })
    res.cookies.set(
      'merx_www_user',
      JSON.stringify({ name: user.name ?? null, email: user.email, avatarUrl: user.avatarUrl ?? null }),
      { secure: config.isProd, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 }
    )

    return res
  } catch {
    return redirectWithStateCleared(`${config.urls.www}/login?error=oauth_failed`)
  }
}
