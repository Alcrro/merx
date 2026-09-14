import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import type { ITokenService } from '../../application/ports/token-service.port'
import type { PlatformTokenPayload, StoreTokenPayload, TokenPayload } from '../../domain/types'
import { config } from '../../../../config'

const ACCESS_SECRET = config.auth.jwtSecret
const PLATFORM_TOKEN_TTL = '5m'
const STORE_TOKEN_TTL = '15m'
const REFRESH_TTL_DAYS = 30

export class JwtTokenService implements ITokenService {
  signPlatformToken(payload: PlatformTokenPayload): string {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: PLATFORM_TOKEN_TTL, algorithm: 'HS256' })
  }

  signStoreToken(payload: StoreTokenPayload): string {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: STORE_TOKEN_TTL, algorithm: 'HS256' })
  }

  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, ACCESS_SECRET, { algorithms: ['HS256'] }) as TokenPayload
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex')
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  refreshTokenExpiresAt(): Date {
    const d = new Date()
    d.setDate(d.getDate() + REFRESH_TTL_DAYS)
    return d
  }
}

export const jwtTokenService = new JwtTokenService()
