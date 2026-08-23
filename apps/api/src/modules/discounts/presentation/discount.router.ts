import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authenticate, withAuth } from '../../../middleware/authenticate'
import { discountController } from './discount.controller'

// 10 req/min per IP on the public validate endpoint — prevents brute-force code enumeration
const validateRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', code: 'RATE_LIMITED' },
})

export const discountRouter = Router()

// Dashboard routes — authenticated, ownership enforced in service
discountRouter.get('/', authenticate, withAuth(discountController.list))
discountRouter.post('/', authenticate, withAuth(discountController.create))
discountRouter.patch('/:id', authenticate, withAuth(discountController.update))
discountRouter.delete('/:id', authenticate, withAuth(discountController.remove))

// Public validate — mounted on storefrontRouter at /storefront/:slug/discounts/validate (CP10)
export const discountValidateRouter = Router({ mergeParams: true })
discountValidateRouter.post('/', validateRateLimit, discountController.validate)
