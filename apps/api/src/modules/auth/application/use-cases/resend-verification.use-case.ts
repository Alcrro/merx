import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IEmailVerificationRepository } from '../../domain/ports/email-verification.repository.port'
import type { ITokenService } from '../ports/token-service.port'
import type { IEmailService } from '../ports/email-service.port'
import { config } from '../../../../config'

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000

export class ResendVerificationUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly verifyRepo: IEmailVerificationRepository,
    private readonly tokens: ITokenService,
    private readonly emailService: IEmailService
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepo.findUserById(userId)
    if (!user || user.emailVerified) return // silently succeed

    await this.verifyRepo.deleteEmailVerificationTokens(userId)

    const rawToken = this.tokens.generateRefreshToken()
    const tokenHash = this.tokens.hashToken(rawToken)
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS)

    await this.verifyRepo.createEmailVerificationToken({ userId, tokenHash, expiresAt })

    const verifyUrl = `${config.email.appUrl}/verify-email?token=${rawToken}`
    await this.emailService.sendEmailVerificationEmail(user.email, verifyUrl)
  }
}
