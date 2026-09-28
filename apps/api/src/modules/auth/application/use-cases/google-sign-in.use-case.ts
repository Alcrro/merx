import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IStoreRepository } from '../../domain/ports/store.repository.port'
import type { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port'
import type { ITokenService } from '../ports/token-service.port'
import type { IGoogleIdentityProvider } from '../ports/google-identity.port'
import type { AuthUser, AuthStore } from '../../domain/types'
import { AuthError } from '../../domain/errors'

export class GoogleSignInUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly storeRepo: IStoreRepository,
    private readonly tokenRepo: IRefreshTokenRepository,
    private readonly google: IGoogleIdentityProvider,
    private readonly tokens: ITokenService
  ) {}

  async execute(
    code: string,
    meta?: { userAgent?: string; ip?: string }
  ): Promise<{ platformToken: string; refreshToken: string; user: AuthUser; stores: AuthStore[]; avatarUrl: string | null }> {
    const identity = await this.google.exchangeCode(code)

    // Without a verified email we cannot prove ownership — never create or link on it.
    if (!identity.emailVerified) throw AuthError.forbidden('Google email is not verified')

    const email = identity.email.trim().toLowerCase()
    const existing = await this.userRepo.findUserForGoogleSignIn(identity.googleId, email)

    let user: AuthUser
    if (!existing) {
      user = await this.userRepo.createGoogleUser({
        email,
        googleId: identity.googleId,
        name: identity.name,
        avatarUrl: identity.avatarUrl,
      })
    } else {
      if (existing.deleted) throw AuthError.forbidden('Account is deleted')
      if (existing.googleId && existing.googleId !== identity.googleId) {
        throw AuthError.forbidden('Email is linked to a different Google account')
      }

      if (!existing.googleId) {
        // Pre-account-hijacking: an unverified password account may have been registered by someone
        // else on this email. Google proves ownership now, so the untrusted password and its sessions go.
        const untrustedPassword = existing.hasPassword && !existing.emailVerified
        await this.userRepo.linkGoogleAccount(existing.id, identity.googleId, { clearPassword: untrustedPassword })
        if (untrustedPassword) await this.tokenRepo.deleteAllUserRefreshTokens(existing.id)
      }

      const { googleId: _g, hasPassword: _p, deleted: _d, ...authUser } = existing
      user = { ...authUser, emailVerified: true }
    }

    const platformToken = this.tokens.signPlatformToken({ sub: user.id, type: 'platform' })
    const rawRefresh = this.tokens.generateRefreshToken()
    const tokenHash = this.tokens.hashToken(rawRefresh)
    const expiresAt = this.tokens.refreshTokenExpiresAt()
    await this.tokenRepo.createRefreshToken({ userId: user.id, tokenHash, expiresAt, ...meta })

    const stores = await this.storeRepo.findStoresByOwnerId(user.id)

    return { platformToken, refreshToken: rawRefresh, user, stores, avatarUrl: identity.avatarUrl }
  }
}
