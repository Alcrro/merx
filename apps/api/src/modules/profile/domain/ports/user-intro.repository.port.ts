import type { UserIntro } from '../entities/user-intro.entity'

export interface IUserIntroRepository {
  findByUserId(userId: string): Promise<UserIntro | null>
  create(userId: string): Promise<UserIntro>
  save(intro: UserIntro, name: string): Promise<void>
}
