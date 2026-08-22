import type { Response } from 'express'
import { CatalogError, CatalogVariantImageError, ArchiveCriteriaError } from '../../domain/errors'

export function handleCatalogError(err: unknown, res: Response): boolean {
  if (err instanceof CatalogError) {
    const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'CONFLICT' ? 409 : 400
    res.status(status).json({ error: err.message })
    return true
  }
  if (err instanceof ArchiveCriteriaError) {
    const status = err.code === 'NOT_FOUND' ? 404 : 409
    res.status(status).json({ error: err.message })
    return true
  }
  if (err instanceof CatalogVariantImageError) {
    const status = err.code === 'NOT_FOUND' ? 404 : 400
    res.status(status).json({ error: err.message })
    return true
  }
  return false
}
