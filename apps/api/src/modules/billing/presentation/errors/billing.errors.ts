import type { Response } from 'express'
import type { BillingError } from '../../domain/errors'

export function handleBillingError(err: BillingError, res: Response): void {
  const status =
    err.code === 'NOT_FOUND' ? 404
    : err.code === 'CONFLICT' ? 409
    : 400
  res.status(status).json({ error: err.message })
}
