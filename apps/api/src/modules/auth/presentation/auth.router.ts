import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authController } from './auth.controller'
import { authenticate, withAuth } from '../../../middleware/authenticate'

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' },
})

const router = Router()

router.post('/signup', authController.signup)
router.post('/login', loginLimiter, authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authenticate, authController.logout)
router.get('/me', authenticate, withAuth(authController.me))

export { router as authRouter }
