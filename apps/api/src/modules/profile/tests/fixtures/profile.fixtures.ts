import { UserIntro } from '../../domain/entities/user-intro.entity'

export function makeUserIntro(overrides: { completed?: boolean; completedAt?: Date | null } = {}): UserIntro {
  return UserIntro.reconstitute(
    'user-id-1',
    overrides.completed ?? false,
    overrides.completedAt ?? null,
  )
}
