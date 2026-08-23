import { Router } from 'express'
import { authenticate, withAuth } from '../../../middleware/authenticate'
import { shippingController } from './shipping.controller'

const router = Router()
router.use(authenticate)

router.get('/', withAuth(shippingController.getMethods))
router.post('/', withAuth(shippingController.createMethod))
router.patch('/reorder', withAuth(shippingController.reorderMethods))
router.patch('/:id', withAuth(shippingController.updateMethod))
router.delete('/:id', withAuth(shippingController.deleteMethod))

export { router as shippingRouter }
