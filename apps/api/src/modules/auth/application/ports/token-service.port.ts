import type { AccessTokenPayload } from '../../domain/types'

export interface ITokenService {
  signAccessToken(payload: AccessTokenPayload): string
  verifyAccessToken(token: string): AccessTokenPayload
  generateRefreshToken(): string
  hashToken(token: string): string
  refreshTokenExpiresAt(): Date
}
