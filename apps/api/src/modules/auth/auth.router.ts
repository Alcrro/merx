import { createHash } from 'crypto'
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import type { Response, NextFunction } from 'express'
import { authenticate, withAuth } from '../../middleware/authenticate'
import type { AuthenticatedRequest } from '../../middleware/authenticate'
import { prisma } from '../../lib/prisma'
import {
  signupUseCase, loginUseCase, refreshUseCase, platformRefreshUseCase, ssoExchangeUseCase,
  createSsoCodeUseCase, googleSignInUseCase, forgotPasswordUseCase, resetPasswordUseCase,
  verifyEmailUseCase, resendVerificationUseCase, sessionService, meQuery,
} from './container'
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

// platform-refresh is called server-to-server by www, so every www user shares www's egress IP.
// Strict limit per refresh token (per session); the per-IP limit is only a coarse flood guard.
const platformRefreshPerTokenLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const token = (req.body as { refreshToken?: unknown } | undefined)?.refreshToken
    return typeof token === 'string' && token.length > 0
      ? `rt:${createHash('sha256').update(token).digest('hex')}`
      : `ip:${req.ip ?? 'unknown'}`
  },
  message: { error: 'Too many refresh attempts, please try again later' },
})

const platformRefreshPerIpLimiter = rateLimit({
  windowMs: 60_000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many refresh attempts, please try again later' },
})

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many password reset attempts, please try again later' },
})

const router = Router()
const controller = createAuthController({
  signupUseCase, loginUseCase, refreshUseCase, platformRefreshUseCase, ssoExchangeUseCase,
  createSsoCodeUseCase, googleSignInUseCase, forgotPasswordUseCase, resetPasswordUseCase,
  verifyEmailUseCase, resendVerificationUseCase, sessionService, meQuery,
})

router.post('/signup', signupLimiter, controller.signup)
router.post('/login', loginLimiter, controller.login)
router.post('/google', loginLimiter, controller.googleSignIn)
router.post('/refresh', refreshLimiter, controller.refresh)
router.post('/platform-refresh', platformRefreshPerIpLimiter, platformRefreshPerTokenLimiter, controller.platformRefresh)
router.post('/logout', authenticate, withAuth(controller.logout))
router.get('/me', authenticate, withAuth(controller.me))
router.post('/sso/code', authenticate, withAuth(controller.createSsoCode))
router.post('/sso/exchange', controller.ssoExchange)
router.post('/forgot-password', passwordResetLimiter, controller.forgotPassword)
router.post('/reset-password', passwordResetLimiter, controller.resetPassword)
router.post('/verify-email', controller.verifyEmail)
router.post('/resend-verification', authenticate, withAuth(controller.resendVerification))

router.delete('/google', authenticate, withAuth(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { password: true, googleId: true },
    })
    if (!user?.googleId) {
      res.status(400).json({ error: 'Google account is not linked.' })
      return
    }
    if (!user.password) {
      res.status(400).json({ error: 'Set a password before unlinking Google.' })
      return
    }
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { googleId: null },
    })
    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}))

export { router as authRouter }
