import { cookies } from 'next/headers'

export interface WwwUser {
  name: string | null
  email: string
  avatarUrl: string | null
}

export async function getWwwUser(): Promise<WwwUser | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('merx_www_user')?.value
  if (!raw) return null
  try {
    return JSON.parse(raw) as WwwUser
  } catch (err) {
    console.error('[session] failed to parse user cookie:', err)
    return null
  }
}
