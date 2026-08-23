import type { IUserIntroRepository } from '../../domain/ports/user-intro.repository.port'
import type { CompleteIntroDto } from '../dto/complete-intro.dto'
import { ProfileError } from '../../domain/errors'

export class CompleteIntroUseCase {
  constructor(private readonly introRepo: IUserIntroRepository) {}

  async execute(userId: string, dto: CompleteIntroDto): Promise<void> {
    let intro = await this.introRepo.findByUserId(userId)
    if (!intro) intro = await this.introRepo.create(userId)
    if (intro.completed) return

    intro.complete()
    await this.introRepo.save(intro, dto.name)
  }
}
