import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '@/services/prisma'
import { AppError } from '@/errors/app.error'
import { ErrorCode } from '@/errors/codes'
import { config } from '@/config'

export async function updateUserProfile(
  userId: string,
  name: string,
  preferredLocale: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { name, preferredLocale },
  })
}

export async function refreshDisplayCookie(email: string, name: string): Promise<void> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('merx_www_user')?.value
  if (!raw) return
  const parsed = JSON.parse(raw)
  cookieStore.set('merx_www_user', JSON.stringify({ ...parsed, name }), {
    secure: config.isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function verifyDeletePassword(
  storedHash: string | null,
  inputPassword: string | null
): Promise<void> {
  if (!storedHash) return
  if (!inputPassword)
    throw new AppError('Password required', 'Parola este obligatorie.', ErrorCode.ACCOUNT_VALIDATION, 422)
  const valid = await bcrypt.compare(inputPassword, storedHash)
  if (!valid)
    throw new AppError('Wrong password', 'Parolă incorectă.', ErrorCode.ACCOUNT_VALIDATION, 422)
}

export async function softDeleteUser(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  })
}
