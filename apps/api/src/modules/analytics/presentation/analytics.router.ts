import { Router } from 'express'
import { authenticate, withAuth } from '../../../middleware/authenticate'
import { analyticsController } from './analytics.controller'

const router = Router()
router.use(authenticate)

router.get('/overview', withAuth(analyticsController.overview))
router.get('/revenue-chart', withAuth(analyticsController.revenueChart))
router.get('/top-products', withAuth(analyticsController.topProducts))
router.post('/recalculate', withAuth(analyticsController.recalculate))

export { router as analyticsRouter }
