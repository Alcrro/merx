import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../../middleware/authenticate'
import { OrderService, OrderError } from '../application/order.service'
import { OrderRepository } from '../infrastructure/order.repository'
import {
  listOrdersSchema,
  createOrderSchema,
  updateStatusSchema,
  updatePaymentStatusSchema,
  updateFulfillmentStatusSchema,
} from './order.schema'

const service = new OrderService(new OrderRepository())

function handleError(err: unknown, res: Response): void {
  if (err instanceof OrderError) {
    const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'CONFLICT' ? 409 : 400
    res.status(status).json({ error: err.message })
    return
  }
  throw err
}

export const orderController = {
  list: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const params = listOrdersSchema.parse(req.query)
      const result = await service.list({ storeId: req.user.storeId, ...params })
      res.json(result)
    } catch (err) {
      if (err instanceof OrderError) handleError(err, res); else next(err)
    }
  },

  get: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const order = await service.get(req.params.id, req.user.storeId)
      res.json(order)
    } catch (err) {
      if (err instanceof OrderError) handleError(err, res); else next(err)
    }
  },

  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = createOrderSchema.parse(req.body)
      const order = await service.create(req.user.storeId, data)
      res.status(201).json(order)
    } catch (err) {
      if (err instanceof OrderError) handleError(err, res); else next(err)
    }
  },

  updateStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { status } = updateStatusSchema.parse(req.body)
      const order = await service.updateStatus(req.params.id, req.user.storeId, status)
      res.json(order)
    } catch (err) {
      if (err instanceof OrderError) handleError(err, res); else next(err)
    }
  },

  updatePaymentStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { paymentStatus } = updatePaymentStatusSchema.parse(req.body)
      const order = await service.updatePaymentStatus(req.params.id, req.user.storeId, paymentStatus)
      res.json(order)
    } catch (err) {
      if (err instanceof OrderError) handleError(err, res); else next(err)
    }
  },

  updateFulfillmentStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { fulfillmentStatus } = updateFulfillmentStatusSchema.parse(req.body)
      const order = await service.updateFulfillmentStatus(req.params.id, req.user.storeId, fulfillmentStatus)
      res.json(order)
    } catch (err) {
      if (err instanceof OrderError) handleError(err, res); else next(err)
    }
  },

  cancel: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const order = await service.cancel(req.params.id, req.user.storeId)
      res.json(order)
    } catch (err) {
      if (err instanceof OrderError) handleError(err, res); else next(err)
    }
  },
}
