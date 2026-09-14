import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IStoreRepository } from '../../domain/ports/store.repository.port'
import type { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port'
import type { IPasswordHasher } from '../ports/password-hasher.port'
import type { ITokenService } from '../ports/token-service.port'
import type { AuthUser, AuthStore } from '../../domain/types'
import { AuthError } from '../../domain/errors'

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly storeRepo: IStoreRepository,
    private readonly tokenRepo: IRefreshTokenRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService
  ) {}

  async execute(
    email: string,
    password: string,
    meta?: { userAgent?: string; ip?: string }
  ): Promise<{ platformToken: string; refreshToken: string; user: AuthUser; stores: AuthStore[] }> {
    const user = await this.userRepo.findUserByEmail(email)
    const valid = user ? await this.hasher.compare(password, user.password) : false
    if (!user || !valid) throw AuthError.unauthorized()

    const { password: _omit, ...safeUser } = user

    const platformToken = this.tokens.signPlatformToken({ sub: safeUser.id, type: 'platform' })
    const rawRefresh = this.tokens.generateRefreshToken()
    const tokenHash = this.tokens.hashToken(rawRefresh)
    const expiresAt = this.tokens.refreshTokenExpiresAt()
    await this.tokenRepo.createRefreshToken({ userId: safeUser.id, tokenHash, expiresAt, ...meta })

    const stores = await this.storeRepo.findStoresByOwnerId(safeUser.id)

    return { platformToken, refreshToken: rawRefresh, user: safeUser, stores }
  }
}
