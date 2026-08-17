import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../../middleware/authenticate'
import { ProductService, ProductError } from '../application/product.service'
import { ProductRepository } from '../infrastructure/product.repository'
import { getProductAnalytics } from '../application/product-analytics.service'
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
  listProductsSchema,
  createCategorySchema,
} from './product.schema'

const service = new ProductService(new ProductRepository())

function handleError(err: unknown, res: Response): void {
  if (err instanceof ProductError) {
    const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'CONFLICT' ? 409 : 400
    res.status(status).json({ error: err.message })
    return
  }
  throw err
}

export const productController = {
  list: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const params = listProductsSchema.parse(req.query)
      const result = await service.list({ storeId: req.user.storeId, ...params })
      res.json(result)
    } catch (err) {
      if (err instanceof ProductError) handleError(err, res); else next(err)
    }
  },

  get: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const product = await service.get(req.params.id, req.user.storeId)
      res.json(product)
    } catch (err) {
      if (err instanceof ProductError) handleError(err, res); else next(err)
    }
  },

  getAnalytics: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const product = await service.get(req.params.id, req.user.storeId)
      const analytics = await getProductAnalytics(product.id, req.user.storeId)
      res.json(analytics)
    } catch (err) {
      if (err instanceof ProductError) handleError(err, res); else next(err)
    }
  },

  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = createProductSchema.parse(req.body)
      const product = await service.create(req.user.storeId, data)
      res.status(201).json(product)
    } catch (err) {
      if (err instanceof ProductError) handleError(err, res); else next(err)
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = updateProductSchema.parse(req.body)
      const product = await service.update(req.params.id, req.user.storeId, data)
      res.json(product)
    } catch (err) {
      if (err instanceof ProductError) handleError(err, res); else next(err)
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await service.delete(req.params.id, req.user.storeId)
      res.sendStatus(204)
    } catch (err) {
      if (err instanceof ProductError) handleError(err, res); else next(err)
    }
  },

  createVariant: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = createVariantSchema.parse(req.body)
      const variant = await service.createVariant(req.params.id, req.user.storeId, data)
      res.status(201).json(variant)
    } catch (err) {
      if (err instanceof ProductError) handleError(err, res); else next(err)
    }
  },

  updateVariant: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = updateVariantSchema.parse(req.body)
      const variant = await service.updateVariant(req.params.variantId, req.params.id, req.user.storeId, data)
      res.json(variant)
    } catch (err) {
      if (err instanceof ProductError) handleError(err, res); else next(err)
    }
  },

  deleteVariant: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await service.deleteVariant(req.params.variantId, req.params.id, req.user.storeId)
      res.sendStatus(204)
    } catch (err) {
      if (err instanceof ProductError) handleError(err, res); else next(err)
    }
  },

  listCategories: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const categories = await service.listCategories(req.user.storeId)
      res.json(categories)
    } catch (err) {
      next(err)
    }
  },

  createCategory: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { name, parentId } = createCategorySchema.parse(req.body)
      const category = await service.createCategory(req.user.storeId, name, parentId)
      res.status(201).json(category)
    } catch (err) {
      if (err instanceof ProductError) handleError(err, res); else next(err)
    }
  },
}
