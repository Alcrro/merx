import type { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port'
import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { ITokenService } from '../ports/token-service.port'
import { AuthError } from '../../domain/errors'

export class PlatformRefreshUseCase {
  constructor(
    private readonly tokenRepo: IRefreshTokenRepository,
    private readonly userRepo: IUserRepository,
    private readonly tokens: ITokenService
  ) {}

  async execute(refreshToken: string): Promise<{ accessToken: string }> {
    const tokenHash = this.tokens.hashToken(refreshToken)
    const token = await this.tokenRepo.findRefreshToken(tokenHash)

    if (!token) throw AuthError.unauthorized('Invalid refresh token')

    if (token.isReused()) {
      await this.tokenRepo.deleteAllUserRefreshTokens(token.userId)
      throw AuthError.tokenReuse()
    }

    if (token.isExpired()) throw AuthError.unauthorized('Refresh token expired')

    const user = await this.userRepo.findUserById(token.userId)
    if (!user) throw AuthError.notFound('User not found')

    const newExpiry = this.tokens.refreshTokenExpiresAt()
    await this.tokenRepo.extendRefreshToken(token.id, newExpiry)

    const accessToken = this.tokens.signPlatformToken({ sub: user.id, type: 'platform' })

    return { accessToken }
  }
}
