import { config } from '@/config'

export function buildCookie(name: string, value: string, maxAge: number, httpOnly = true): string {
  const parts = [`${name}=${value}`, `Max-Age=${maxAge}`, 'Path=/', 'SameSite=Lax']
  if (httpOnly) parts.push('HttpOnly')
  if (config.isProd) parts.push('Secure')
  return parts.join('; ')
}

export function parseCookie(header: string, name: string): string | undefined {
  return header
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1)
}
