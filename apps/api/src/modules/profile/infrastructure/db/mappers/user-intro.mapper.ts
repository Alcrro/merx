import { UserIntro } from '../../../domain/entities/user-intro.entity'

interface UserIntroRecord {
  userId: string
  completed: boolean
  completedAt: Date | null
}

export const userIntroMapper = {
  toDomain(record: UserIntroRecord): UserIntro {
    return UserIntro.reconstitute(record.userId, record.completed, record.completedAt)
  },
}
