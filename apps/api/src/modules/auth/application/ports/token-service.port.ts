import type { PlatformTokenPayload, StoreTokenPayload, TokenPayload } from '../../domain/types'

export interface ITokenService {
  signPlatformToken(payload: PlatformTokenPayload): string
  signStoreToken(payload: StoreTokenPayload): string
  verifyToken(token: string): TokenPayload
  generateRefreshToken(): string
  hashToken(token: string): string
  refreshTokenExpiresAt(): Date
}
