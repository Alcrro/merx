import { Router } from 'express'
import { authenticate, withAuth } from '../../../middleware/authenticate'
import { storeController } from './store.controller'

const router = Router()

router.use(authenticate)
router.get('/current', withAuth(storeController.getCurrent))
router.put('/current', withAuth(storeController.updateCurrent))

export { router as storeRouter }
