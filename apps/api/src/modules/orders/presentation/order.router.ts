import { Router } from 'express'
import { authenticate, withAuth } from '../../../middleware/authenticate'
import { orderController } from './order.controller'

const router = Router()
router.use(authenticate)

router.get('/', withAuth(orderController.list))
router.post('/', withAuth(orderController.create))
router.get('/:id', withAuth(orderController.get))
router.patch('/:id/status', withAuth(orderController.updateStatus))
router.patch('/:id/payment', withAuth(orderController.updatePaymentStatus))
router.patch('/:id/fulfillment', withAuth(orderController.updateFulfillmentStatus))
router.post('/:id/cancel', withAuth(orderController.cancel))

export { router as orderRouter }
