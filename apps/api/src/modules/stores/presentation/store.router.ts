import { Router } from 'express'
import { authenticate, withAuth } from '../../../middleware/authenticate'
import { storeController } from './store.controller'

const router = Router()

router.use(authenticate)
router.get('/current', withAuth(storeController.getCurrent))
router.put('/current', withAuth(storeController.updateCurrent))
router.delete('/current', withAuth(storeController.deleteCurrent))

export { router as storeRouter }
