import { Router } from 'express'
import { authenticate, withAuth } from '../../../middleware/authenticate'
import { customerController } from './customer.controller'

const router = Router()
router.use(authenticate)

router.get('/', withAuth(customerController.list))
router.get('/:id/analytics', withAuth(customerController.getAnalytics))
router.get('/:id', withAuth(customerController.get))

export { router as customerRouter }
