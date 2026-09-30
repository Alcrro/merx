import { cookies } from 'next/headers'
import { config } from '@/config'

/**
 * Returns an API access token for the current www session.
 * Reuses the short-lived `merx_www_access` cookie (its maxAge matches the token TTL) and only calls
 * platform-refresh when it is missing — every refresh call counts against the API rate limit.
 */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()

  const accessToken = cookieStore.get('merx_www_access')?.value
  if (accessToken) return accessToken

  const refreshToken = cookieStore.get('merx_www_refresh')?.value
  if (!refreshToken) return null

  const res = await fetch(`${config.api.url}/api/v1/auth/platform-refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) return null

  const data = (await res.json()) as { accessToken: string }
  return data.accessToken
}
