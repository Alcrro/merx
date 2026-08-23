import type { Response } from 'express'
import { ProfileError } from '../../domain/errors'

export function handleProfileError(err: ProfileError, res: Response): void {
  res.status(err.statusCode).json({ error: err.message })
}
