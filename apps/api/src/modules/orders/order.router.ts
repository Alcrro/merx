import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authenticate, withAuth } from '../../middleware/authenticate'
import { orderQuery, orderService, cancelOrderUseCase, refundOrderUseCase, orderEventRepo } from './container'
import { createOrderController } from './presentation/controllers/order.controller'

const router = Router()
const controller = createOrderController({ orderQuery, orderService, cancelOrderUseCase, refundOrderUseCase, orderEventRepo })

const writeLimiter = rateLimit({ windowMs: 60_000, max: 30 })
const refundLimiter = rateLimit({ windowMs: 60_000, max: 10 })

router.use(authenticate)

router.get('/', withAuth(controller.list))
router.post('/', writeLimiter, withAuth(controller.create))
router.get('/:id', withAuth(controller.get))
router.patch('/:id/status', withAuth(controller.updateStatus))
router.patch('/:id/payment', withAuth(controller.updatePaymentStatus))
router.patch('/:id/fulfillment', withAuth(controller.updateFulfillmentStatus))
router.get('/:id/events', withAuth(controller.getEvents))
router.post('/:id/cancel', writeLimiter, withAuth(controller.cancel))
router.post('/:id/refund', refundLimiter, withAuth(controller.refund))

export { router as orderRouter }
