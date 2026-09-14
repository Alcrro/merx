import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IPasswordResetRepository } from '../../domain/ports/password-reset.repository.port'
import type { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port'
import type { IPasswordHasher } from '../ports/password-hasher.port'
import type { ITokenService } from '../ports/token-service.port'
import { AuthError } from '../../domain/errors'

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly resetRepo: IPasswordResetRepository,
    private readonly tokenRepo: IRefreshTokenRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService
  ) {}

  async execute(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = this.tokens.hashToken(rawToken)
    const record = await this.resetRepo.findPasswordResetToken(tokenHash)

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw AuthError.invalidToken()
    }

    const passwordHash = await this.hasher.hash(newPassword)

    await this.userRepo.updateUserPassword(record.userId, passwordHash)
    await this.resetRepo.markPasswordResetTokenUsed(record.id)
    await this.tokenRepo.deleteAllUserRefreshTokens(record.userId)
  }
}
