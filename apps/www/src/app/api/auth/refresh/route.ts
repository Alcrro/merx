import { buildCookie, parseCookie } from '@/lib/auth/cookies'
import { config } from '@/config'

export async function POST(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const rawToken = parseCookie(cookieHeader, 'merx_www_refresh')

  if (!rawToken) return new Response(null, { status: 401 })

  let res: Response
  try {
    res = await fetch(`${config.api.url}/api/v1/auth/platform-refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rawToken }),
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    return new Response(null, { status: 502 })
  }

  if (res.status === 401) {
    const response = new Response(null, { status: 401 })
    response.headers.append('Set-Cookie', buildCookie('merx_www_refresh', '', 0))
    response.headers.append('Set-Cookie', buildCookie('merx_www_access', '', 0, false))
    return response
  }

  if (!res.ok) return new Response(null, { status: 500 })

  const { accessToken } = (await res.json()) as { accessToken: string }

  const response = new Response(null, { status: 200 })
  response.headers.append('Set-Cookie', buildCookie('merx_www_access', accessToken, 60 * 5))
  return response
}
