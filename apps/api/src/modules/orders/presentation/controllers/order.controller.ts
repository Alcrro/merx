import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../../../middleware/authenticate'
import type { OrderQuery } from '../../application/queries/order.query'
import type { OrderService } from '../../application/services/order.service'
import type { CancelOrderUseCase } from '../../application/use-cases/cancel-order.use-case'
import type { RefundOrderUseCase } from '../../application/use-cases/refund-order.use-case'
import { OrderError } from '../../domain/errors'
import { orderValidator } from '../validators/order.validator'
import { handleOrderError } from '../errors/order.errors'
import { toOrderResponse } from '../mappers/order.mapper'

export type OrderControllerDeps = {
  orderQuery: OrderQuery
  orderService: OrderService
  cancelOrderUseCase: CancelOrderUseCase
  refundOrderUseCase: RefundOrderUseCase
}

export function createOrderController({ orderQuery, orderService, cancelOrderUseCase, refundOrderUseCase }: OrderControllerDeps) {
  return {
    list: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const params = orderValidator.list.parse(req.query)
        const result = await orderQuery.list({ storeId: req.user.storeId, ...params })
        res.json({ ...result, data: result.data.map(toOrderResponse) })
      } catch (err) {
        if (err instanceof OrderError) handleOrderError(err, res); else next(err)
      }
    },

    get: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params
        const order = /^ORD-\d+-\d{8}$/.test(id)
          ? await orderQuery.getBySlug(id, req.user.storeId)
          : await orderQuery.get(id, req.user.storeId)
        res.json(toOrderResponse(order))
      } catch (err) {
        if (err instanceof OrderError) handleOrderError(err, res); else next(err)
      }
    },

    create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const data = orderValidator.create.parse(req.body)
        const order = await orderService.create(req.user.storeId, data)
        res.status(201).json(toOrderResponse(order))
      } catch (err) {
        if (err instanceof OrderError) handleOrderError(err, res); else next(err)
      }
    },

    updateStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const { status } = orderValidator.updateStatus.parse(req.body)
        const order = await orderService.updateStatus(req.params.id, req.user.storeId, status)
        res.json(toOrderResponse(order))
      } catch (err) {
        if (err instanceof OrderError) handleOrderError(err, res); else next(err)
      }
    },

    updatePaymentStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const { paymentStatus } = orderValidator.updatePaymentStatus.parse(req.body)
        const order = await orderService.updatePaymentStatus(req.params.id, req.user.storeId, paymentStatus)
        res.json(toOrderResponse(order))
      } catch (err) {
        if (err instanceof OrderError) handleOrderError(err, res); else next(err)
      }
    },

    updateFulfillmentStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const { fulfillmentStatus } = orderValidator.updateFulfillmentStatus.parse(req.body)
        const order = await orderService.updateFulfillmentStatus(req.params.id, req.user.storeId, fulfillmentStatus)
        res.json(toOrderResponse(order))
      } catch (err) {
        if (err instanceof OrderError) handleOrderError(err, res); else next(err)
      }
    },

    cancel: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const order = await cancelOrderUseCase.execute(req.params.id, req.user.storeId)
        res.json(toOrderResponse(order))
      } catch (err) {
        if (err instanceof OrderError) handleOrderError(err, res); else next(err)
      }
    },

    refund: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const { amount } = orderValidator.refund.parse(req.body)
        const order = await refundOrderUseCase.execute(req.params.id, req.user.storeId, amount)
        res.json(toOrderResponse(order))
      } catch (err) {
        if (err instanceof OrderError) handleOrderError(err, res); else next(err)
      }
    },
  }
}
