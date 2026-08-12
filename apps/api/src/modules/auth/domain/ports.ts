import type { AuthUser, AuthStore } from './entities'

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<(AuthUser & { password: string }) | null>
  findUserById(id: string): Promise<AuthUser | null>
  createUser(data: { email: string; password: string; name?: string }): Promise<AuthUser>

  findStoreByOwnerId(ownerId: string): Promise<AuthStore | null>
  createStore(data: { ownerId: string; name: string; slug: string }): Promise<AuthStore>

  findRefreshToken(tokenHash: string): Promise<{ id: string; userId: string; used: boolean; expiresAt: Date } | null>
  createRefreshToken(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>
  markRefreshTokenUsed(id: string): Promise<void>
  deleteRefreshToken(tokenHash: string): Promise<void>
  deleteAllUserRefreshTokens(userId: string): Promise<void>
}
