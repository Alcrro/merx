import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import type { ITokenService } from '../../application/ports/token-service.port'
import type { AccessTokenPayload } from '../../domain/types'
import { config } from '../../../../config'

const ACCESS_SECRET = config.auth.jwtSecret
const ACCESS_TTL = '15m' as const
const REFRESH_TTL_DAYS = 30

export class JwtTokenService implements ITokenService {
  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL, algorithm: 'HS256' })
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, ACCESS_SECRET, { algorithms: ['HS256'] }) as AccessTokenPayload
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
