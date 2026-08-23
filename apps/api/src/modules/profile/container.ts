import { prisma } from '../../lib/prisma'
import { UserIntroRepository } from './infrastructure/db/repositories/user-intro.repository'
import { CompleteIntroUseCase } from './application/use-cases/complete-intro.use-case'

export const introRepo = new UserIntroRepository(prisma)
export const completeIntroUseCase = new CompleteIntroUseCase(introRepo)
