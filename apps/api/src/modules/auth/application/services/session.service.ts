import type { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port'
import type { ITokenService } from '../ports/token-service.port'
import type { AuthTokens } from '../../domain/types'

export class SessionService {
  constructor(
    private readonly repo: IRefreshTokenRepository,
    private readonly tokens: ITokenService
  ) {}

  async generate(userId: string, storeId: string, role: string): Promise<AuthTokens> {
    const accessToken = this.tokens.signAccessToken({ sub: userId, storeId, role })
    const rawRefresh = this.tokens.generateRefreshToken()
    const tokenHash = this.tokens.hashToken(rawRefresh)
    const expiresAt = this.tokens.refreshTokenExpiresAt()

    await this.repo.createRefreshToken({ userId, tokenHash, expiresAt })

    return { accessToken, refreshToken: rawRefresh }
  }

  async revoke(refreshToken: string, userId: string): Promise<void> {
    const tokenHash = this.tokens.hashToken(refreshToken)
    await this.repo.deleteRefreshToken(tokenHash, userId)
  }
}
