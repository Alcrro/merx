import { NextResponse } from 'next/server'
import { config } from '@/config'
import { generateOAuthState, setOAuthStateCookie } from '@/lib/auth/oauth-state'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

export function GET() {
  const state = generateOAuthState()
  const params = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: `${config.urls.www}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    state,
  })

  const res = NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params}`)
  setOAuthStateCookie(res, state)
  return res
}
