import type { Response, NextFunction } from 'express'
import type { AuthenticatedStoreRequest as AuthenticatedRequest } from '../../../middleware/authenticate'
import { themeService } from '../application/theme.service'
import { ThemeError } from '../domain/entities'
import { applyPatchSchema, publishSchema } from './theme.schema'

function handleError(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof ThemeError) {
    const status =
      err.code === 'NOT_FOUND' || err.code === 'NO_DRAFT' || err.code === 'NO_PUBLISHED' || err.code === 'VERSION_NOT_FOUND'
        ? 404
        : err.code === 'CONTRAST_FAIL'
          ? 422
          : 400
    res.status(status).json({ error: err.message, code: err.code })
    return
  }
  next(err)
}

export const themeController = {
  getSummary: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const summary = await themeService.getSummary(req.user.storeId)
      res.json(summary)
    } catch (err) {
      handleError(err, res, next)
    }
  },

  createDraft: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const draft = await themeService.createDraft(req.user.storeId)
      res.status(201).json(draft)
    } catch (err) {
      handleError(err, res, next)
    }
  },

  applyPatch: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = applyPatchSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(422).json({ error: 'Invalid theme config', details: parsed.error.flatten() })
        return
      }
      const draft = await themeService.applyPatch(req.user.storeId, parsed.data.config)
      res.json(draft)
    } catch (err) {
      handleError(err, res, next)
    }
  },

  publish: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parsed = publishSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() })
        return
      }
      const result = await themeService.publish(req.user.storeId, { forcePublish: parsed.data.forcePublish })
      res.json(result)
    } catch (err) {
      handleError(err, res, next)
    }
  },

  rollback: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { versionId } = req.params
      if (!versionId) {
        res.status(400).json({ error: 'Missing versionId' })
        return
      }
      const version = await themeService.rollback(req.user.storeId, versionId)
      res.json(version)
    } catch (err) {
      handleError(err, res, next)
    }
  },
}
