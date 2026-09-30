import { config } from '@/config'

// Identity comes only from the access token — never from the display cookie (merx_www_user).
export async function createSsoCode(accessToken: string): Promise<string | null> {
  const res = await fetch(`${config.api.url}/api/v1/auth/sso/code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: '{}',
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) return null

  const data = (await res.json()) as { code: string }
  return data.code
}
