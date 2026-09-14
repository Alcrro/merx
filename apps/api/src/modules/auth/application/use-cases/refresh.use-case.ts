import type { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port'
import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IStoreRepository } from '../../domain/ports/store.repository.port'
import type { ITokenService } from '../ports/token-service.port'
import type { AuthTokens } from '../../domain/types'
import { AuthError } from '../../domain/errors'

export class RefreshUseCase {
  constructor(
    private readonly tokenRepo: IRefreshTokenRepository,
    private readonly userRepo: IUserRepository,
    private readonly storeRepo: IStoreRepository,
    private readonly tokens: ITokenService
  ) {}

  async execute(refreshToken: string, slug: string): Promise<AuthTokens> {
    const tokenHash = this.tokens.hashToken(refreshToken)
    const token = await this.tokenRepo.findRefreshToken(tokenHash)

    if (!token) throw AuthError.unauthorized('Invalid refresh token')

    if (token.isReused()) {
      await this.tokenRepo.deleteAllUserRefreshTokens(token.userId)
      throw AuthError.tokenReuse()
    }

    if (token.isExpired()) throw AuthError.unauthorized('Refresh token expired')

    const store = await this.storeRepo.findStoreBySlug(slug)
    if (!store) throw AuthError.notFound('Store not found')

    if (store.ownerId !== token.userId) throw AuthError.forbidden()

    if (store.status === 'blocked') throw AuthError.forbidden('Store is blocked')

    const user = await this.userRepo.findUserById(token.userId)
    if (!user) throw AuthError.notFound('User not found')

    const accessToken = this.tokens.signStoreToken({ sub: user.id, storeId: store.id, type: 'store' })
    const rawRefresh = this.tokens.generateRefreshToken()
    const newTokenHash = this.tokens.hashToken(rawRefresh)
    const expiresAt = this.tokens.refreshTokenExpiresAt()

    await this.tokenRepo.rotateRefreshToken(token.id, {
      userId: token.userId,
      tokenHash: newTokenHash,
      expiresAt,
      userAgent: token.userAgent ?? undefined,
      ip: token.ip ?? undefined,
    })

    return { accessToken, refreshToken: rawRefresh }
  }
}
