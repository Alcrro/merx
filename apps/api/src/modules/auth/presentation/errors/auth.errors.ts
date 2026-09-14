import type { Response } from 'express'
import { AuthError } from '../../domain/errors'

export function handleAuthError(err: AuthError, res: Response): void {
  const status =
    err.code === 'CONFLICT' ? 409
    : err.code === 'NOT_FOUND' ? 404
    : err.code === 'FORBIDDEN' ? 403
    : err.code === 'INVALID_TOKEN' ? 400
    : 401
  res.status(status).json({ error: err.message })
}
