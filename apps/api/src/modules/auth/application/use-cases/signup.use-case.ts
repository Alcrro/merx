import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port'
import type { IEmailVerificationRepository } from '../../domain/ports/email-verification.repository.port'
import type { IPasswordHasher } from '../ports/password-hasher.port'
import type { ITokenService } from '../ports/token-service.port'
import type { IEmailService } from '../ports/email-service.port'
import type { AuthUser } from '../../domain/types'
import { AuthError } from '../../domain/errors'
import { config } from '../../../../config'

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000

export class SignupUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenRepo: IRefreshTokenRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService,
    private readonly verifyRepo: IEmailVerificationRepository,
    private readonly emailService: IEmailService
  ) {}

  async execute(
    email: string,
    password: string,
    meta?: { userAgent?: string; ip?: string }
  ): Promise<{ platformToken: string; refreshToken: string; user: AuthUser }> {
    const existing = await this.userRepo.findUserByEmail(email)
    if (existing) throw AuthError.conflict('Email already registered')

    const passwordHash = await this.hasher.hash(password)
    const user = await this.userRepo.createUser({ email, password: passwordHash })

    const platformToken = this.tokens.signPlatformToken({ sub: user.id, type: 'platform' })
    const rawRefresh = this.tokens.generateRefreshToken()
    const tokenHash = this.tokens.hashToken(rawRefresh)
    const expiresAt = this.tokens.refreshTokenExpiresAt()
    await this.tokenRepo.createRefreshToken({ userId: user.id, tokenHash, expiresAt, ...meta })

    const rawVerifyToken = this.tokens.generateRefreshToken()
    const verifyTokenHash = this.tokens.hashToken(rawVerifyToken)
    const verifyExpiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS)
    await this.verifyRepo.createEmailVerificationToken({ userId: user.id, tokenHash: verifyTokenHash, expiresAt: verifyExpiresAt })
    const verifyUrl = `${config.email.appUrl}/verify-email?token=${rawVerifyToken}`
    // fire-and-forget: email failure nu blochează signup-ul
    this.emailService.sendEmailVerificationEmail(user.email, verifyUrl).catch(() => {})

    return { platformToken, refreshToken: rawRefresh, user }
  }
}
