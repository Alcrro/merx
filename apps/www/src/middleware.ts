import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

const PROTECTED = ['/account', '/checkout']
const AUTH_ONLY = ['/login', '/signup']

function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(`/${locale}`.length)
    if (pathname === `/${locale}`) return '/'
  }
  return pathname
}

function localizePath(locale: string, path: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const currentLocale =
    routing.locales.find(
      (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
    ) ?? routing.defaultLocale

  const unprefixed = stripLocale(pathname)
  const accessToken = request.cookies.get('merx_www_access')?.value
  const refreshToken = request.cookies.get('merx_www_refresh')?.value

  let isAuthenticated = !!(accessToken || refreshToken)
  const newCookies: string[] = []

  if (!accessToken && refreshToken) {
    try {
      const refreshUrl = new URL('/api/auth/refresh', request.nextUrl.origin)
      const refreshRes = await fetch(refreshUrl, {
        method: 'POST',
        headers: { cookie: request.headers.get('cookie') ?? '' },
        signal: AbortSignal.timeout(4000),
      })
      newCookies.push(...refreshRes.headers.getSetCookie())
      if (!refreshRes.ok) isAuthenticated = false
    } catch {
      // Network error — assume still authenticated to avoid locking out the user
    }
  }

  let response: NextResponse

  if (isAuthenticated && AUTH_ONLY.some((p) => unprefixed.startsWith(p))) {
    response = NextResponse.redirect(
      new URL(localizePath(currentLocale, '/account'), request.url)
    )
  } else if (!isAuthenticated && PROTECTED.some((p) => unprefixed.startsWith(p))) {
    response = NextResponse.redirect(
      new URL(localizePath(currentLocale, '/login'), request.url)
    )
  } else {
    response = intlMiddleware(request)
  }

  for (const cookie of newCookies) {
    response.headers.append('Set-Cookie', cookie)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/|logos/|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.webp$|.*\\.ico$).*)'],
}
