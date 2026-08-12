import type { Request, Response, NextFunction } from 'express'
import { AuthService, AuthError } from '../application/auth.service'
import { AuthRepository } from '../infrastructure/auth.repository'
import { signupSchema, loginSchema, refreshSchema, logoutSchema } from './auth.schema'
import type { AuthenticatedRequest } from '../../../middleware/authenticate'

const service = new AuthService(new AuthRepository())

function handleAuthError(err: unknown, res: Response): void {
  if (err instanceof AuthError) {
    const status =
      err.code === 'CONFLICT' ? 409 : err.code === 'NOT_FOUND' ? 404 : err.code === 'TOKEN_REUSE' ? 401 : 401
    res.status(status).json({ error: err.message })
    return
  }
  throw err
}

export const authController = {
  signup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = signupSchema.parse(req.body)
      const { tokens, user, store } = await service.signup(input.email, input.password, input.name)
      res.status(201).json({ ...tokens, user, store })
    } catch (err) {
      if (err instanceof AuthError) {
        handleAuthError(err, res)
      } else {
        next(err)
      }
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = loginSchema.parse(req.body)
      const { tokens, user, store } = await service.login(input.email, input.password)
      res.json({ ...tokens, user, store })
    } catch (err) {
      if (err instanceof AuthError) {
        handleAuthError(err, res)
      } else {
        next(err)
      }
    }
  },

  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = refreshSchema.parse(req.body)
      const tokens = await service.refresh(refreshToken)
      res.json(tokens)
    } catch (err) {
      if (err instanceof AuthError) {
        handleAuthError(err, res)
      } else {
        next(err)
      }
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = logoutSchema.parse(req.body)
      await service.logout(refreshToken)
      res.sendStatus(204)
    } catch (err) {
      next(err)
    }
  },

  me: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await service.me(req.user.userId)
      res.json(result)
    } catch (err) {
      if (err instanceof AuthError) {
        handleAuthError(err, res)
      } else {
        next(err)
      }
    }
  },
}
