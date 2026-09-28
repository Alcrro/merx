import type { Request, Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../../../middleware/authenticate'
import type { SignupUseCase } from '../../application/use-cases/signup.use-case'
import type { LoginUseCase } from '../../application/use-cases/login.use-case'
import type { RefreshUseCase } from '../../application/use-cases/refresh.use-case'
import type { PlatformRefreshUseCase } from '../../application/use-cases/platform-refresh.use-case'
import type { SsoExchangeUseCase } from '../../application/use-cases/sso-exchange.use-case'
import type { CreateSsoCodeUseCase } from '../../application/use-cases/create-sso-code.use-case'
import type { GoogleSignInUseCase } from '../../application/use-cases/google-sign-in.use-case'
import type { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case'
import type { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case'
import type { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case'
import type { ResendVerificationUseCase } from '../../application/use-cases/resend-verification.use-case'
import type { SessionService } from '../../application/services/session.service'
import type { MeQuery } from '../../application/queries/me.query'
import { AuthError } from '../../domain/errors'
import { authValidator } from '../validators/auth.validator'
import { handleAuthError } from '../errors/auth.errors'
import { authMapper } from '../mappers/auth.mapper'

export type AuthControllerDeps = {
  signupUseCase: SignupUseCase
  loginUseCase: LoginUseCase
  refreshUseCase: RefreshUseCase
  platformRefreshUseCase: PlatformRefreshUseCase
  ssoExchangeUseCase: SsoExchangeUseCase
  createSsoCodeUseCase: CreateSsoCodeUseCase
  googleSignInUseCase: GoogleSignInUseCase
  forgotPasswordUseCase: ForgotPasswordUseCase
  resetPasswordUseCase: ResetPasswordUseCase
  verifyEmailUseCase: VerifyEmailUseCase
  resendVerificationUseCase: ResendVerificationUseCase
  sessionService: SessionService
  meQuery: MeQuery
}

export function createAuthController({
  signupUseCase,
  loginUseCase,
  refreshUseCase,
  platformRefreshUseCase,
  ssoExchangeUseCase,
  createSsoCodeUseCase,
  googleSignInUseCase,
  forgotPasswordUseCase,
  resetPasswordUseCase,
  verifyEmailUseCase,
  resendVerificationUseCase,
  sessionService,
  meQuery,
}: AuthControllerDeps) {
  return {
    signup: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = authValidator.signup.parse(req.body)
        const userAgent = (req.headers['x-forwarded-ua'] as string | undefined) ?? req.headers['user-agent']
        const ip = (req.headers['x-real-ip'] as string | undefined) ?? req.ip
        const result = await signupUseCase.execute(input.email, input.password, { userAgent, ip })
        res.status(201).json(authMapper.toSignupResponse(result.platformToken, result.refreshToken, result.user))
      } catch (err) {
        if (err instanceof AuthError) handleAuthError(err, res); else next(err)
      }
    },

    login: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = authValidator.login.parse(req.body)
        const userAgent = (req.headers['x-forwarded-ua'] as string | undefined) ?? req.headers['user-agent']
        const ip = (req.headers['x-real-ip'] as string | undefined) ?? req.ip
        const result = await loginUseCase.execute(input.email, input.password, { userAgent, ip })
        res.json(authMapper.toLoginResponse(result.platformToken, result.refreshToken, result.user, result.stores))
      } catch (err) {
        if (err instanceof AuthError) handleAuthError(err, res); else next(err)
      }
    },

    refresh: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { refreshToken, slug } = authValidator.refresh.parse(req.body)
        const tokens = await refreshUseCase.execute(refreshToken, slug)
        res.json(authMapper.toRefreshResponse(tokens))
      } catch (err) {
        if (err instanceof AuthError) handleAuthError(err, res); else next(err)
      }
    },

    platformRefresh: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { refreshToken } = authValidator.platformRefresh.parse(req.body)
        const result = await platformRefreshUseCase.execute(refreshToken)
        res.json(authMapper.toPlatformRefreshResponse(result.accessToken))
      } catch (err) {
        if (err instanceof AuthError) handleAuthError(err, res); else next(err)
      }
    },

    logout: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const { refreshToken } = authValidator.logout.parse(req.body)
        await sessionService.revoke(refreshToken, req.user.userId)
        res.sendStatus(204)
      } catch (err) {
        next(err)
      }
    },

    me: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const result = await meQuery.execute(req.user.userId)
        res.json(authMapper.toMeResponse(result.user, result.stores))
      } catch (err) {
        if (err instanceof AuthError) handleAuthError(err, res); else next(err)
      }
    },

    ssoExchange: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { code } = authValidator.ssoExchange.parse(req.body)
        const userAgent = req.headers['user-agent']
        const ip = req.ip
        const result = await ssoExchangeUseCase.execute(code, { userAgent, ip })
        res.json(authMapper.toLoginResponse(result.platformToken, result.refreshToken, result.user, result.stores))
      } catch (err) {
        if (err instanceof AuthError) handleAuthError(err, res); else next(err)
      }
    },

    googleSignIn: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { code } = authValidator.googleSignIn.parse(req.body)
        const userAgent = (req.headers['x-forwarded-ua'] as string | undefined) ?? req.headers['user-agent']
        const ip = (req.headers['x-real-ip'] as string | undefined) ?? req.ip
        const result = await googleSignInUseCase.execute(code, { userAgent, ip })
        res.json(authMapper.toGoogleSignInResponse(result.platformToken, result.refreshToken, result.user, result.stores, result.avatarUrl))
      } catch (err) {
        if (err instanceof AuthError) handleAuthError(err, res); else next(err)
      }
    },

    createSsoCode: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const result = await createSsoCodeUseCase.execute(req.user.userId)
        res.json(result)
      } catch (err) {
        if (err instanceof AuthError) handleAuthError(err, res); else next(err)
      }
    },

    forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email } = authValidator.forgotPassword.parse(req.body)
        await forgotPasswordUseCase.execute(email)
        res.status(200).json({ message: 'If the email exists, a reset link has been sent' })
      } catch (err) {
        next(err)
      }
    },

    resetPassword: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { token, password } = authValidator.resetPassword.parse(req.body)
        await resetPasswordUseCase.execute(token, password)
        res.status(200).json({ message: 'Password updated successfully' })
      } catch (err) {
        if (err instanceof AuthError) handleAuthError(err, res); else next(err)
      }
    },

    verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { token } = authValidator.verifyEmail.parse(req.body)
        await verifyEmailUseCase.execute(token)
        res.status(200).json({ message: 'Email verified successfully' })
      } catch (err) {
        if (err instanceof AuthError) handleAuthError(err, res); else next(err)
      }
    },

    resendVerification: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        await resendVerificationUseCase.execute(req.user.userId)
        res.status(200).json({ message: 'If the email is unverified, a new link has been sent' })
      } catch (err) {
        next(err)
      }
    },
  }
}
