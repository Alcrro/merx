import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../../middleware/authenticate'
import { StoreService, StoreError } from '../application/store.service'
import { StoreRepository } from '../infrastructure/store.repository'
import { updateStoreSchema } from './store.schema'

const service = new StoreService(new StoreRepository())

function handleStoreError(err: unknown, res: Response): void {
  if (err instanceof StoreError) {
    const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'FORBIDDEN' ? 403 : 400
    res.status(status).json({ error: err.message })
    return
  }
  throw err
}

export const storeController = {
  getCurrent: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const store = await service.getCurrent(req.user.storeId)
      res.json(store)
    } catch (err) {
      if (err instanceof StoreError) handleStoreError(err, res)
      else next(err)
    }
  },

  updateCurrent: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = updateStoreSchema.parse(req.body)
      const store = await service.update(req.user.storeId, data)
      res.json(store)
    } catch (err) {
      if (err instanceof StoreError) handleStoreError(err, res)
      else next(err)
    }
  },

  deleteCurrent: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await service.delete(req.user.storeId, req.user.userId)
      res.status(204).end()
    } catch (err) {
      if (err instanceof StoreError) handleStoreError(err, res)
      else next(err)
    }
  },
}
