import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IPasswordResetRepository } from '../../domain/ports/password-reset.repository.port'
import type { ITokenService } from '../ports/token-service.port'
import type { IEmailService } from '../ports/email-service.port'
import { config } from '../../../../config'

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly resetRepo: IPasswordResetRepository,
    private readonly tokens: ITokenService,
    private readonly emailService: IEmailService
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepo.findUserByEmail(email)
    if (!user) return // anti-enumeration: silently succeed

    await this.resetRepo.deleteExpiredPasswordResetTokens(user.id)

    const rawToken = this.tokens.generateRefreshToken()
    const tokenHash = this.tokens.hashToken(rawToken)
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS)

    await this.resetRepo.createPasswordResetToken({ userId: user.id, tokenHash, expiresAt })

    const resetUrl = `${config.email.appUrl}/reset-password?token=${rawToken}`
    await this.emailService.sendPasswordResetEmail(user.email, resetUrl)
  }
}
