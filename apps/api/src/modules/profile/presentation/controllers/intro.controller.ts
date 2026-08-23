import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../../../middleware/authenticate'
import type { CompleteIntroUseCase } from '../../application/use-cases/complete-intro.use-case'
import type { IUserIntroRepository } from '../../domain/ports/user-intro.repository.port'
import { ProfileError } from '../../domain/errors'
import { introValidator } from '../validators/intro.validator'
import { handleProfileError } from '../errors/profile.errors'
import { introMapper } from '../mappers/intro.mapper'

export type IntroControllerDeps = {
  completeIntroUseCase: CompleteIntroUseCase
  introRepo: IUserIntroRepository
}

export function createIntroController({ completeIntroUseCase, introRepo }: IntroControllerDeps) {
  return {
    getState: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const intro = await introRepo.findByUserId(req.user.userId)
        res.json(introMapper.toStateDto(intro))
      } catch (err) {
        next(err)
      }
    },

    complete: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const dto = introValidator.complete.parse(req.body)
        await completeIntroUseCase.execute(req.user.userId, dto)
        res.json(introMapper.toCompleteDto(dto.name))
      } catch (err) {
        if (err instanceof ProfileError) handleProfileError(err, res); else next(err)
      }
    },
  }
}
