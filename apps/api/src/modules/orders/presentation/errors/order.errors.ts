import type { Response } from 'express'
import { OrderError } from '../../domain/errors'


export function handleOrderError(err: OrderError, res: Response): void {
  const status =
    err.code === 'NOT_FOUND' ? 404
    : err.code === 'CONFLICT' ? 409
    : err.code === 'STRIPE_ERROR' ? 503
    : 400
  res.status(status).json({ error: err.message })
}
