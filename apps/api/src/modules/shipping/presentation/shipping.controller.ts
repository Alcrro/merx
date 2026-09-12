import type { Response, NextFunction, Request } from 'express'
import type { AuthenticatedStoreRequest as AuthenticatedRequest } from '../../../middleware/authenticate'
import { shippingService, ShippingError } from '../application/shipping.service'
import { createShippingMethodSchema, updateShippingMethodSchema, reorderShippingSchema } from './shipping.schema'
import { prisma } from '../../../lib/prisma'

export const shippingController = {
  getMethods: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const methods = await shippingService.getMethods(req.user.storeId)
      res.json(methods)
    } catch (err) {
      next(err)
    }
  },

  createMethod: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = createShippingMethodSchema.parse(req.body)
      const method = await shippingService.createMethod(req.user.storeId, {
        ...data,
        description: data.description ?? null,
        minOrderForFree: data.minOrderForFree ?? null,
        position: data.position ?? 0,
      })
      res.status(201).json(method)
    } catch (err) {
      next(err)
    }
  },

  updateMethod: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = updateShippingMethodSchema.parse(req.body)
      const method = await shippingService.updateMethod(req.params.id, req.user.storeId, data)
      res.json(method)
    } catch (err) {
      if (err instanceof ShippingError && err.code === 'NOT_FOUND') {
        res.status(404).json({ error: err.message })
        return
      }
      next(err)
    }
  },

  deleteMethod: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await shippingService.deleteMethod(req.params.id, req.user.storeId)
      res.status(204).send()
    } catch (err) {
      if (err instanceof ShippingError && err.code === 'NOT_FOUND') {
        res.status(404).json({ error: err.message })
        return
      }
      next(err)
    }
  },

  reorderMethods: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { ids } = reorderShippingSchema.parse(req.body)
      await shippingService.reorderMethods(req.user.storeId, ids)
      res.status(200).json({ ok: true })
    } catch (err) {
      next(err)
    }
  },

  // Public — called from storefront
  getActiveMethodsPublic: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug
      const subtotal = Number(req.query.subtotal) || 0
      const country = typeof req.query.country === 'string' ? req.query.country : undefined

      const store = await prisma.store.findUnique({ where: { slug }, select: { id: true } })
      if (!store) { res.status(404).json({ error: 'Store not found' }); return }

      const methods = await shippingService.getActiveMethodsWithPrice(store.id, subtotal, country)
      res.json(methods)
    } catch (err) {
      next(err)
    }
  },
}
