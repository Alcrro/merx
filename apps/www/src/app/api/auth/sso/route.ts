import { NextResponse } from 'next/server'
import { createSsoCode } from '@/lib/auth/sso'
import { getAccessToken } from '@/lib/auth/access-token'
import { config } from '@/config'

export async function GET() {
  const loginUrl = `${config.urls.dashboard}/login`

  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return NextResponse.redirect(loginUrl)

    const code = await createSsoCode(accessToken)
    if (!code) return NextResponse.redirect(loginUrl)

    return NextResponse.redirect(`${config.urls.dashboard}/sso?code=${encodeURIComponent(code)}`)
  } catch {
    return NextResponse.redirect(loginUrl)
  }
}
