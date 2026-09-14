import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IEmailVerificationRepository } from '../../domain/ports/email-verification.repository.port'
import type { ITokenService } from '../ports/token-service.port'
import { AuthError } from '../../domain/errors'

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly verifyRepo: IEmailVerificationRepository,
    private readonly tokens: ITokenService
  ) {}

  async execute(rawToken: string): Promise<void> {
    const tokenHash = this.tokens.hashToken(rawToken)
    const record = await this.verifyRepo.findEmailVerificationToken(tokenHash)

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw AuthError.invalidToken()
    }

    await this.userRepo.updateEmailVerified(record.userId, true)
    await this.verifyRepo.markEmailVerificationTokenUsed(record.id)
  }
}
