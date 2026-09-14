import type { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port'
import type { ITokenService } from '../ports/token-service.port'

export class SessionService {
  constructor(
    private readonly repo: IRefreshTokenRepository,
    private readonly tokens: ITokenService
  ) {}

  async revoke(refreshToken: string, userId: string): Promise<void> {
    const tokenHash = this.tokens.hashToken(refreshToken)
    await this.repo.deleteRefreshToken(tokenHash, userId)
  }
}
