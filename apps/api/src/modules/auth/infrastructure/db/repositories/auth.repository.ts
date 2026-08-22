import type { IUserRepository } from '../../../domain/ports/user.repository.port'
import type { IStoreRepository } from '../../../domain/ports/store.repository.port'
import type { IRefreshTokenRepository } from '../../../domain/ports/refresh-token.repository.port'
import type { AuthUser, AuthStore } from '../../../domain/types'
import { RefreshToken } from '../../../domain/entities/refresh-token.entity'
import { prisma } from '../../../../../lib/prisma'

export class AuthRepository implements IUserRepository, IStoreRepository, IRefreshTokenRepository {
  async findUserByEmail(email: string): Promise<(AuthUser & { password: string }) | null> {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, createdAt: true, password: true },
    })
  }

  async findUserById(id: string): Promise<AuthUser | null> {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })
  }

  async createUser(data: { email: string; password: string; name?: string }): Promise<AuthUser> {
    return prisma.user.create({
      data,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })
  }

  async findStoreByOwnerId(ownerId: string): Promise<AuthStore | null> {
    return prisma.store.findFirst({
      where: { ownerId, deletedAt: null },
      select: { id: true, name: true, slug: true, currency: true },
    })
  }

  async createStore(data: { ownerId: string; name: string; slug: string }): Promise<AuthStore> {
    return prisma.store.create({
      data,
      select: { id: true, name: true, slug: true, currency: true },
    })
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    const record = await prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      select: { id: true, userId: true, used: true, expiresAt: true },
    })
    if (!record) return null
    return new RefreshToken(record.id, record.userId, record.expiresAt, record.used)
  }

  async createRefreshToken(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await prisma.refreshToken.create({
      data: { userId: data.userId, token: data.tokenHash, expiresAt: data.expiresAt },
    })
  }

  async rotateRefreshToken(
    usedId: string,
    newData: { userId: string; tokenHash: string; expiresAt: Date }
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({ where: { id: usedId }, data: { used: true } })
      await tx.refreshToken.create({
        data: { userId: newData.userId, token: newData.tokenHash, expiresAt: newData.expiresAt },
      })
    })
  }

  async markRefreshTokenUsed(id: string): Promise<void> {
    await prisma.refreshToken.update({ where: { id }, data: { used: true } })
  }

  async deleteRefreshToken(tokenHash: string, userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token: tokenHash, userId } })
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } })
  }
}
