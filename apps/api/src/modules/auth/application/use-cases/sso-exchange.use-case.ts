import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IStoreRepository } from '../../domain/ports/store.repository.port'
import type { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port'
import type { ITokenService } from '../ports/token-service.port'
import type { AuthUser, AuthStore } from '../../domain/types'
import { AuthError } from '../../domain/errors'

export class SsoExchangeUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly storeRepo: IStoreRepository,
    private readonly tokenRepo: IRefreshTokenRepository,
    private readonly tokens: ITokenService
  ) {}

  async execute(
    code: string,
    meta?: { userAgent?: string; ip?: string }
  ): Promise<{ platformToken: string; refreshToken: string; user: AuthUser; stores: AuthStore[] }> {
    const user = await this.userRepo.consumeSsoCode(code)
    if (!user) throw AuthError.unauthorized()

    const platformToken = this.tokens.signPlatformToken({ sub: user.id, type: 'platform' })
    const rawRefresh = this.tokens.generateRefreshToken()
    const tokenHash = this.tokens.hashToken(rawRefresh)
    const expiresAt = this.tokens.refreshTokenExpiresAt()
    await this.tokenRepo.createRefreshToken({ userId: user.id, tokenHash, expiresAt, ...meta })

    const stores = await this.storeRepo.findStoresByOwnerId(user.id)

    return { platformToken, refreshToken: rawRefresh, user, stores }
  }
}
