import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { ITokenService } from '../ports/token-service.port'
import { AuthError } from '../../domain/errors'

const SSO_CODE_TTL_MS = 60_000

export class CreateSsoCodeUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokens: ITokenService
  ) {}

  async execute(userId: string): Promise<{ code: string }> {
    const user = await this.userRepo.findUserById(userId)
    if (!user) throw AuthError.unauthorized()

    const code = this.tokens.generateRefreshToken()
    await this.userRepo.setSsoCode(user.id, code, new Date(Date.now() + SSO_CODE_TTL_MS))

    return { code }
  }
}
