import { Router } from 'express'
import { authenticate, withAuth } from '../../../middleware/authenticate'
import { notificationController } from './notification.controller'

const router = Router({ mergeParams: true })
router.use(authenticate)

router.get('/', withAuth(notificationController.list))
router.post('/read-all', withAuth(notificationController.markAllRead))
router.post('/:id/read', withAuth(notificationController.markRead))

export { router as notificationRouter }
