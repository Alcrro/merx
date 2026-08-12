import type { IAuthRepository } from '../domain/ports'
import type { AuthUser, AuthStore } from '../domain/entities'
import { prisma } from '../../../lib/prisma'

export class AuthRepository implements IAuthRepository {
  async findUserByEmail(email: string): Promise<(AuthUser & { password: string }) | null> {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, createdAt: true, password: true },
    })
  }

  async findUserById(id: string): Promise<AuthUser | null> {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, createdAt: true },
    })
  }

  async createUser(data: { email: string; password: string; name?: string }): Promise<AuthUser> {
    return prisma.user.create({
      data,
      select: { id: true, email: true, name: true, createdAt: true },
    })
  }

  async findStoreByOwnerId(ownerId: string): Promise<AuthStore | null> {
    return prisma.store.findFirst({
      where: { ownerId },
      select: { id: true, name: true, slug: true, currency: true },
    })
  }

  async createStore(data: { ownerId: string; name: string; slug: string }): Promise<AuthStore> {
    return prisma.store.create({
      data,
      select: { id: true, name: true, slug: true, currency: true },
    })
  }

  async findRefreshToken(
    tokenHash: string
  ): Promise<{ id: string; userId: string; used: boolean; expiresAt: Date } | null> {
    return prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      select: { id: true, userId: true, used: true, expiresAt: true },
    })
  }

  async createRefreshToken(data: {
    userId: string
    tokenHash: string
    expiresAt: Date
  }): Promise<void> {
    await prisma.refreshToken.create({
      data: { userId: data.userId, token: data.tokenHash, expiresAt: data.expiresAt },
    })
  }

  async markRefreshTokenUsed(id: string): Promise<void> {
    await prisma.refreshToken.update({ where: { id }, data: { used: true } })
  }

  async deleteRefreshToken(tokenHash: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token: tokenHash } })
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } })
  }
}
