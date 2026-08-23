import type { PrismaClient } from '@prisma/client'
import { userIntroMapper } from '../mappers/user-intro.mapper'
import type { UserIntro } from '../../../domain/entities/user-intro.entity'
import type { IUserIntroRepository } from '../../../domain/ports/user-intro.repository.port'

type Db = PrismaClient

const SELECT = { userId: true, completed: true, completedAt: true } as const

export class UserIntroRepository implements IUserIntroRepository {
  constructor(private readonly db: Db) {}

  async findByUserId(userId: string): Promise<UserIntro | null> {
    const record = await this.db.userIntro.findUnique({ where: { userId }, select: SELECT })
    if (!record) return null
    return userIntroMapper.toDomain(record)
  }

  async create(userId: string): Promise<UserIntro> {
    const record = await this.db.userIntro.create({ data: { userId }, select: SELECT })
    return userIntroMapper.toDomain(record)
  }

  async save(intro: UserIntro, name: string): Promise<void> {
    await this.db.$transaction(async (tx) => {
      await tx.user.update({ where: { id: intro.userId }, data: { name } })
      await tx.userIntro.update({
        where: { userId: intro.userId },
        data: { completed: intro.completed, completedAt: intro.completedAt },
      })
    })
  }
}
