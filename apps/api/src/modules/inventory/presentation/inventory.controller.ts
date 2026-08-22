import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../../middleware/authenticate'
import { InventoryService, InventoryError } from '../application/inventory.service'
import { InventoryRepository } from '../infrastructure/inventory.repository'
import { listInventorySchema, adjustSchema, reorderPointSchema, setStockSchema, setStatusSchema } from './inventory.schema'

const service = new InventoryService(new InventoryRepository())

function handleError(err: unknown, res: Response): void {
  if (err instanceof InventoryError) {
    const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'CONFLICT' ? 409 : 400
    res.status(status).json({ error: err.message })
    return
  }
  throw err
}

export const inventoryController = {
  list: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const params = listInventorySchema.parse(req.query)
      const result = await service.list({ storeId: req.user.storeId, ...params })
      res.json(result)
    } catch (err) {
      if (err instanceof InventoryError) handleError(err, res); else next(err)
    }
  },

  get: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const item = await service.get(req.params.variantId, req.user.storeId)
      res.json(item)
    } catch (err) {
      if (err instanceof InventoryError) handleError(err, res); else next(err)
    }
  },

  adjust: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = adjustSchema.parse(req.body)
      const item = await service.adjust(req.params.variantId, req.user.storeId, data)
      res.json(item)
    } catch (err) {
      if (err instanceof InventoryError) handleError(err, res); else next(err)
    }
  },

  updateReorderPoint: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { reorderPoint } = reorderPointSchema.parse(req.body)
      const item = await service.updateReorderPoint(req.params.variantId, req.user.storeId, reorderPoint)
      res.json(item)
    } catch (err) {
      if (err instanceof InventoryError) handleError(err, res); else next(err)
    }
  },

  listMovements: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const movements = await service.listMovements(req.params.variantId, req.user.storeId)
      res.json(movements)
    } catch (err) {
      if (err instanceof InventoryError) handleError(err, res); else next(err)
    }
  },

  listStore: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = listInventorySchema.parse(req.query)
      const result = await service.listStore(req.user.storeId, page, limit)
      res.json(result)
    } catch (err) {
      if (err instanceof InventoryError) handleError(err, res); else next(err)
    }
  },

  setStock: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { type, quantity } = setStockSchema.parse(req.body)
      const item = await service.setStock(req.params.variantId, req.user.storeId, type, quantity)
      res.json(item)
    } catch (err) {
      if (err instanceof InventoryError) handleError(err, res); else next(err)
    }
  },

  setVariantStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { isActive } = setStatusSchema.parse(req.body)
      const item = await service.setVariantStatus(req.params.variantId, req.user.storeId, isActive)
      res.json(item)
    } catch (err) {
      if (err instanceof InventoryError) handleError(err, res); else next(err)
    }
  },
}
