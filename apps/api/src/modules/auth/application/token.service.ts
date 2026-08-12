import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import type { AccessTokenPayload } from '../domain/entities'
import { config } from '../../../config'

const ACCESS_SECRET = config.auth.jwtSecret
const REFRESH_SECRET = config.auth.jwtRefreshSecret
const ACCESS_TTL = '15m' as const
const REFRESH_TTL_DAYS = 30

export const tokenService = {
  signAccessToken: (payload: AccessTokenPayload): string =>
    jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL }),

  verifyAccessToken: (token: string): AccessTokenPayload =>
    jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload,

  generateRefreshToken: (): string => crypto.randomBytes(40).toString('hex'),

  hashToken: (token: string): string =>
    crypto.createHash('sha256').update(token).digest('hex'),

  refreshTokenExpiresAt: (): Date => {
    const d = new Date()
    d.setDate(d.getDate() + REFRESH_TTL_DAYS)
    return d
  },

  // Used for refresh token JWTs if needed in future; unused for now but kept as util
  signRefreshJwt: (userId: string): string =>
    jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: '30d' }),
}
