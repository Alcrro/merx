import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '@/services/prisma'
import { AppError } from '@/errors/app.error'
import { ErrorCode } from '@/errors/codes'

export async function getCurrentRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('merx_www_refresh')?.value ?? null
}

export async function verifyCurrentPassword(input: string, hash: string): Promise<void> {
  const valid = await bcrypt.compare(input, hash)
  if (!valid)
    throw new AppError('Wrong password', 'Parola curentă este incorectă.', ErrorCode.ACCOUNT_VALIDATION, 422)
}

export async function setUserPassword(userId: string, plaintext: string): Promise<void> {
  const hashed = await bcrypt.hash(plaintext, 12)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
}

export async function updateUserPassword(userId: string, plaintext: string, currentToken: string | null): Promise<void> {
  const hashed = await bcrypt.hash(plaintext, 12)
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { password: hashed } }),
    prisma.refreshToken.deleteMany({
      where: {
        userId,
        used: false,
        ...(currentToken ? { token: { not: currentToken } } : {}),
      },
    }),
  ])
}

export async function revokeToken(tokenId: string, userId: string, currentToken: string | null): Promise<void> {
  const record = await prisma.refreshToken.findUnique({ where: { id: tokenId } })
  if (!record || record.userId !== userId)
    throw new AppError('Session not found', 'Sesiunea nu a fost găsită.', ErrorCode.ACCOUNT_VALIDATION, 404)
  if (currentToken && record.token === currentToken)
    throw new AppError('Cannot revoke current', 'Nu poți revoca sesiunea curentă.', ErrorCode.ACCOUNT_VALIDATION, 400)
  await prisma.refreshToken.delete({ where: { id: tokenId } })
}

export async function revokeOtherTokens(userId: string, currentToken: string | null): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: {
      userId,
      used: false,
      ...(currentToken ? { token: { not: currentToken } } : {}),
    },
  })
}
