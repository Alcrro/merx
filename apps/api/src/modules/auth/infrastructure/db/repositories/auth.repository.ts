import type { IUserRepository } from '../../../domain/ports/user.repository.port'
import type { IStoreRepository } from '../../../domain/ports/store.repository.port'
import type { IRefreshTokenRepository } from '../../../domain/ports/refresh-token.repository.port'
import type { IPasswordResetRepository, PasswordResetRecord } from '../../../domain/ports/password-reset.repository.port'
import type { IEmailVerificationRepository, EmailVerificationRecord } from '../../../domain/ports/email-verification.repository.port'
import type { AuthUser, AuthStore, AuthStoreWithMeta, GoogleSignInCandidate } from '../../../domain/types'
import { RefreshToken } from '../../../domain/entities/refresh-token.entity'
import { authInfraMapper } from '../mappers/auth.mapper'
import { prisma } from '../../../../../lib/prisma'

export class AuthRepository implements IUserRepository, IStoreRepository, IRefreshTokenRepository, IPasswordResetRepository, IEmailVerificationRepository {
  async findUserByEmail(email: string): Promise<(AuthUser & { password: string }) | null> {
    const row = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, platformRole: true, emailVerified: true, createdAt: true, password: true },
    })
    if (!row || row.password === null) return null
    return { ...authInfraMapper.toAuthUser(row), password: row.password }
  }

  async findUserById(id: string): Promise<AuthUser | null> {
    const row = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, platformRole: true, emailVerified: true, createdAt: true },
    })
    if (!row) return null
    return authInfraMapper.toAuthUser(row)
  }

  async createUser(data: { email: string; password: string; name?: string }): Promise<AuthUser> {
    const row = await prisma.user.create({
      data,
      select: { id: true, email: true, name: true, platformRole: true, emailVerified: true, createdAt: true },
    })
    return authInfraMapper.toAuthUser(row)
  }

  async findUserForGoogleSignIn(googleId: string, email: string): Promise<GoogleSignInCandidate | null> {
    const select = {
      id: true, email: true, name: true, platformRole: true, emailVerified: true, createdAt: true,
      googleId: true, password: true, deletedAt: true,
    } as const
    const row =
      (await prisma.user.findUnique({ where: { googleId }, select })) ??
      (await prisma.user.findUnique({ where: { email }, select }))
    if (!row) return null
    return {
      ...authInfraMapper.toAuthUser(row),
      googleId: row.googleId,
      hasPassword: row.password !== null,
      deleted: row.deletedAt !== null,
    }
  }

  async createGoogleUser(data: { email: string; googleId: string; name: string | null; avatarUrl: string | null }): Promise<AuthUser> {
    const row = await prisma.user.create({
      data: { ...data, authProvider: 'google', emailVerified: true },
      select: { id: true, email: true, name: true, platformRole: true, emailVerified: true, createdAt: true },
    })
    return authInfraMapper.toAuthUser(row)
  }

  async linkGoogleAccount(userId: string, googleId: string, options: { clearPassword: boolean }): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleId,
        emailVerified: true,
        ...(options.clearPassword ? { password: null, authProvider: 'google' } : {}),
      },
    })
  }

  async setSsoCode(userId: string, code: string, expiresAt: Date): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { ssoCode: code, ssoCodeExpiresAt: expiresAt },
    })
  }

  async consumeSsoCode(code: string): Promise<AuthUser | null> {
    const row = await prisma.user.findFirst({
      where: { ssoCode: code, ssoCodeExpiresAt: { gt: new Date() } },
      select: { id: true, email: true, name: true, platformRole: true, emailVerified: true, createdAt: true },
    })
    if (!row) return null

    // Conditional UPDATE is the compare-and-swap: of N concurrent exchanges, only one sees count === 1.
    const { count } = await prisma.user.updateMany({
      where: { id: row.id, ssoCode: code },
      data: { ssoCode: null, ssoCodeExpiresAt: null },
    })
    if (count !== 1) return null
    return authInfraMapper.toAuthUser(row)
  }

  async findStoreBySlug(slug: string): Promise<AuthStoreWithMeta | null> {
    const row = await prisma.store.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, currency: true, ownerId: true, status: true },
    })
    if (!row) return null
    return authInfraMapper.toAuthStoreWithMeta(row)
  }

  async findStoresByOwnerId(ownerId: string): Promise<AuthStore[]> {
    const rows = await prisma.store.findMany({
      where: { ownerId, deletedAt: null },
      select: { id: true, name: true, slug: true, currency: true },
    })
    return rows.map(authInfraMapper.toAuthStore)
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    const record = await prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      select: { id: true, userId: true, used: true, expiresAt: true, userAgent: true, ip: true },
    })
    if (!record) return null
    return new RefreshToken(record.id, record.userId, record.expiresAt, record.used, record.userAgent, record.ip)
  }

  async createRefreshToken(data: { userId: string; tokenHash: string; expiresAt: Date; userAgent?: string; ip?: string }): Promise<void> {
    await prisma.refreshToken.create({
      data: {
        userId: data.userId,
        token: data.tokenHash,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent ?? null,
        ip: data.ip ?? null,
      },
    })
  }

  async rotateRefreshToken(
    usedId: string,
    newData: { userId: string; tokenHash: string; expiresAt: Date; userAgent?: string; ip?: string }
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({ where: { id: usedId }, data: { used: true } })
      await tx.refreshToken.create({
        data: {
          userId: newData.userId,
          token: newData.tokenHash,
          expiresAt: newData.expiresAt,
          userAgent: newData.userAgent ?? null,
          ip: newData.ip ?? null,
        },
      })
    })
  }

  async markRefreshTokenUsed(id: string): Promise<void> {
    await prisma.refreshToken.update({ where: { id }, data: { used: true } })
  }

  async extendRefreshToken(id: string, newExpiry: Date): Promise<void> {
    await prisma.refreshToken.update({ where: { id }, data: { expiresAt: newExpiry } })
  }

  async deleteRefreshToken(tokenHash: string, userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token: tokenHash, userId } })
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } })
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { password: passwordHash } })
  }

  async updateEmailVerified(userId: string, verified: boolean): Promise<void> {
    await prisma.user.update({ where: { id: userId }, data: { emailVerified: verified } })
  }

  // ─── Password Reset ────────────────────────────────────────────────────────

  async createPasswordResetToken(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await prisma.passwordResetToken.create({
      data: { userId: data.userId, tokenHash: data.tokenHash, expiresAt: data.expiresAt },
    })
  }

  async findPasswordResetToken(tokenHash: string): Promise<PasswordResetRecord | null> {
    const row = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    })
    return row ?? null
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    await prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } })
  }

  async deleteExpiredPasswordResetTokens(userId: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({
      where: { userId, expiresAt: { lt: new Date() } },
    })
  }

  // ─── Email Verification ────────────────────────────────────────────────────

  async createEmailVerificationToken(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await prisma.emailVerificationToken.create({
      data: { userId: data.userId, tokenHash: data.tokenHash, expiresAt: data.expiresAt },
    })
  }

  async findEmailVerificationToken(tokenHash: string): Promise<EmailVerificationRecord | null> {
    const row = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    })
    return row ?? null
  }

  async markEmailVerificationTokenUsed(id: string): Promise<void> {
    await prisma.emailVerificationToken.update({ where: { id }, data: { usedAt: new Date() } })
  }

  async deleteEmailVerificationTokens(userId: string): Promise<void> {
    await prisma.emailVerificationToken.deleteMany({ where: { userId } })
  }
}
