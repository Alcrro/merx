import type { RefreshToken } from '../entities/refresh-token.entity'

export interface IRefreshTokenRepository {
  findRefreshToken(tokenHash: string): Promise<RefreshToken | null>
  createRefreshToken(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>
  rotateRefreshToken(usedId: string, newData: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>
  markRefreshTokenUsed(id: string): Promise<void>
  deleteRefreshToken(tokenHash: string, userId: string): Promise<void>
  deleteAllUserRefreshTokens(userId: string): Promise<void>
}
