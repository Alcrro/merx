import type { RefreshToken } from '../entities/refresh-token.entity'

export interface IRefreshTokenRepository {
  findRefreshToken(tokenHash: string): Promise<RefreshToken | null>
  createRefreshToken(data: { userId: string; tokenHash: string; expiresAt: Date; userAgent?: string; ip?: string }): Promise<void>
  rotateRefreshToken(usedId: string, newData: { userId: string; tokenHash: string; expiresAt: Date; userAgent?: string; ip?: string }): Promise<void>
  markRefreshTokenUsed(id: string): Promise<void>
  deleteRefreshToken(tokenHash: string, userId: string): Promise<void>
  extendRefreshToken(id: string, newExpiry: Date): Promise<void>
  deleteAllUserRefreshTokens(userId: string): Promise<void>
}
