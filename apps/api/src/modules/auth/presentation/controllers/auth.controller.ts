import type { Request, Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../../../middleware/authenticate'
import type { SignupUseCase } from '../../application/use-cases/signup.use-case'
import type { LoginUseCase } from '../../application/use-cases/login.use-case'
import type { RefreshUseCase } from '../../application/use-cases/refresh.use-case'
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
  sessionService: SessionService
  meQuery: MeQuery
}

export function createAuthController({
  signupUseCase,
  loginUseCase,
  refreshUseCase,
  sessionService,
  meQuery,
}: AuthControllerDeps) {
  return {
    signup: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = authValidator.signup.parse(req.body)
        const result = await signupUseCase.execute(input.email, input.password)
        res.status(201).json(authMapper.toAuthResponse(result.tokens, result.user, result.store))
      } catch (err) {
        if (err instanceof AuthError) handleAuthError(err, res); else next(err)
      }
    },

    login: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const input = authValidator.login.parse(req.body)
        const result = await loginUseCase.execute(input.email, input.password)
        res.json(authMapper.toAuthResponse(result.tokens, result.user, result.store))
      } catch (err) {
        if (err instanceof AuthError) handleAuthError(err, res); else next(err)
      }
    },

    refresh: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { refreshToken } = authValidator.refresh.parse(req.body)
        const tokens = await refreshUseCase.execute(refreshToken)
        res.json(authMapper.toTokensDto(tokens))
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
        res.json(authMapper.toMeResponse(result.user, result.store))
      } catch (err) {
        if (err instanceof AuthError) handleAuthError(err, res); else next(err)
      }
    },
  }
}
