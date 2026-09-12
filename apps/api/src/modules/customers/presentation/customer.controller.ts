import type { Response, NextFunction } from 'express'
import type { AuthenticatedStoreRequest as AuthenticatedRequest } from '../../../middleware/authenticate'
import { CustomerService, CustomerError } from '../application/customer.service'
import { CustomerRepository } from '../infrastructure/customer.repository'
import { getCustomerAnalytics } from '../application/customer-analytics.service'
import { listCustomersSchema } from './customer.schema'

const service = new CustomerService(new CustomerRepository())

function handleError(err: unknown, res: Response): void {
  if (err instanceof CustomerError) {
    res.status(404).json({ error: err.message })
    return
  }
  throw err
}

export const customerController = {
  list: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const params = listCustomersSchema.parse(req.query)
      const result = await service.list({ storeId: req.user.storeId, ...params })
      res.json(result)
    } catch (err) {
      if (err instanceof CustomerError) handleError(err, res); else next(err)
    }
  },

  get: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const customer = await service.get(req.params.id, req.user.storeId)
      res.json(customer)
    } catch (err) {
      if (err instanceof CustomerError) handleError(err, res); else next(err)
    }
  },

  getAnalytics: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const customer = await service.get(req.params.id, req.user.storeId)
      const analytics = await getCustomerAnalytics(customer.id, req.user.storeId)
      res.json(analytics)
    } catch (err) {
      if (err instanceof CustomerError) handleError(err, res); else next(err)
    }
  },
}
