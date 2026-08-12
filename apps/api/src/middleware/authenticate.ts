import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { tokenService } from '../modules/auth/application/token.service'

export interface AuthUser {
  userId: string
  storeId: string
  role: 'owner' | 'member'
}

// req.user is always set on routes behind the authenticate middleware
export type AuthenticatedRequest = Request & { user: AuthUser }

export const authenticate: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' })
    return
  }

  const token = header.slice(7)
  try {
    const payload = tokenService.verifyAccessToken(token)
    ;(req as AuthenticatedRequest).user = {
      userId: payload.sub,
      storeId: payload.storeId,
      role: payload.role,
    }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Wraps an authenticated handler into a standard RequestHandler.
// Safe because authenticate middleware always sets req.user before these run.
export function withAuth(
  handler: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void> | void
): RequestHandler {
  return handler as unknown as RequestHandler
}
