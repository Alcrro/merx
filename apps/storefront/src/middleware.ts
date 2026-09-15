import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  // myshop.merx.ro → myshop | myshop.localhost:3002 → myshop
  const subdomain = host.split('.')[0].split(':')[0]

  // In dev, set DEV_STORE_SLUG=myshop in .env.local to bypass subdomain requirement
  const slug =
    process.env.DEV_STORE_SLUG ??
    (subdomain && subdomain !== 'localhost' && subdomain !== 'www' ? subdomain : '')

  const response = NextResponse.next()
  if (slug) response.headers.set('x-store-slug', slug)

  const previewId = request.nextUrl.searchParams.get('previewId')
  if (previewId) response.headers.set('x-preview-id', previewId)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
