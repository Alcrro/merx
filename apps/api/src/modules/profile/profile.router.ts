import { Router } from 'express'
import { authenticate, withAuth } from '../../middleware/authenticate'
import { completeIntroUseCase, introRepo } from './container'
import { createIntroController } from './presentation/controllers/intro.controller'

const router = Router()
const controller = createIntroController({ completeIntroUseCase, introRepo })

router.get('/', authenticate, withAuth(controller.getState))
router.post('/complete', authenticate, withAuth(controller.complete))

export { router as introRouter }
