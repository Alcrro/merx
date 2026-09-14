import type { Request, Response, NextFunction, RequestHandler } from 'express'
import type { TokenPayload, StoreTokenPayload } from '../modules/auth/domain/types'
import { jwtTokenService } from '../modules/auth/infrastructure/adapters/jwt.token-service'

export type AuthPayload = TokenPayload & { userId: string }
export type StoreAuthPayload = StoreTokenPayload & { userId: string }

export type AuthenticatedRequest = Request & { user: AuthPayload }
export type AuthenticatedStoreRequest = AuthenticatedRequest & {
  user: StoreAuthPayload
  store: { id: string; name: string; slug: string; status: string; ownerId: string }
}

export const authenticate: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' })
    return
  }

  const token = header.slice(7)
  try {
    const payload = jwtTokenService.verifyToken(token)
    ;(req as AuthenticatedRequest).user = { ...payload, userId: payload.sub }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function withAuth<T extends AuthenticatedRequest = AuthenticatedRequest>(
  handler: (req: T, res: Response, next: NextFunction) => Promise<void> | void
): RequestHandler {
  return handler as unknown as RequestHandler
}
