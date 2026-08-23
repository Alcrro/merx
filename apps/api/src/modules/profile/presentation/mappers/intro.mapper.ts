import type { UserIntro } from '../../domain/entities/user-intro.entity'
import type { IntroStateDto, IntroCompleteDto } from '../dto/intro.dto'

export const introMapper = {
  toStateDto(intro: UserIntro | null): IntroStateDto {
    return { completed: intro?.completed ?? false }
  },

  toCompleteDto(name: string): IntroCompleteDto {
    return { completed: true, userName: name }
  },
}
