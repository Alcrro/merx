import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authenticate, withAuth } from '../../middleware/authenticate'
import { signupUseCase, loginUseCase, refreshUseCase, sessionService, meQuery } from './container'
import { createAuthController } from './presentation/controllers/auth.controller'

const signupLimiter = rateLimit({
  windowMs: 60_000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many signup attempts, please try again later' },
})

const loginLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' },
})

const refreshLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many refresh attempts, please try again later' },
})

const router = Router()
const controller = createAuthController({ signupUseCase, loginUseCase, refreshUseCase, sessionService, meQuery })

router.post('/signup', signupLimiter, controller.signup)
router.post('/login', loginLimiter, controller.login)
router.post('/refresh', refreshLimiter, controller.refresh)
router.post('/logout', authenticate, withAuth(controller.logout))
router.get('/me', authenticate, withAuth(controller.me))

export { router as authRouter }
