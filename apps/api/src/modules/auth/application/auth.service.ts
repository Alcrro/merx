import bcrypt from 'bcryptjs'
import type { IAuthRepository } from '../domain/ports'
import type { AuthUser, AuthStore, AuthTokens } from '../domain/entities'
import { tokenService } from './token.service'

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: 'CONFLICT' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'TOKEN_REUSE'
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export class AuthService {
  constructor(private readonly repo: IAuthRepository) {}

  async signup(
    email: string,
    password: string,
    name?: string
  ): Promise<{ tokens: AuthTokens; user: AuthUser; store: AuthStore }> {
    const existing = await this.repo.findUserByEmail(email)
    if (existing) {
      throw new AuthError('Email already registered', 'CONFLICT')
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await this.repo.createUser({ email, password: passwordHash, name })

    const storeName = name ? `${name}'s Store` : email.split('@')[0]
    const baseSlug = slugify(storeName)
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`
    const store = await this.repo.createStore({ ownerId: user.id, name: storeName, slug })

    const tokens = await this.generateAndStoreTokens(user.id, store.id)
    return { tokens, user, store }
  }

  async login(
    email: string,
    password: string
  ): Promise<{ tokens: AuthTokens; user: AuthUser; store: AuthStore }> {
    const user = await this.repo.findUserByEmail(email)
    if (!user) {
      throw new AuthError('Invalid credentials', 'UNAUTHORIZED')
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new AuthError('Invalid credentials', 'UNAUTHORIZED')
    }

    const store = await this.repo.findStoreByOwnerId(user.id)
    if (!store) {
      throw new AuthError('Store not found', 'NOT_FOUND')
    }

    const tokens = await this.generateAndStoreTokens(user.id, store.id)
    const { password: _omit, ...safeUser } = user
    return { tokens, user: safeUser, store }
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = tokenService.hashToken(refreshToken)
    const stored = await this.repo.findRefreshToken(tokenHash)

    if (!stored) {
      throw new AuthError('Invalid refresh token', 'UNAUTHORIZED')
    }

    if (stored.used) {
      // Token reuse detected — potential theft, invalidate all tokens for this user
      await this.repo.deleteAllUserRefreshTokens(stored.userId)
      throw new AuthError('Token reuse detected', 'TOKEN_REUSE')
    }

    if (stored.expiresAt < new Date()) {
      throw new AuthError('Refresh token expired', 'UNAUTHORIZED')
    }

    await this.repo.markRefreshTokenUsed(stored.id)

    const store = await this.repo.findStoreByOwnerId(stored.userId)
    if (!store) {
      throw new AuthError('Store not found', 'NOT_FOUND')
    }

    return this.generateAndStoreTokens(stored.userId, store.id)
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = tokenService.hashToken(refreshToken)
    await this.repo.deleteRefreshToken(tokenHash)
  }

  async me(userId: string): Promise<{ user: AuthUser; store: AuthStore }> {
    const user = await this.repo.findUserById(userId)
    if (!user) {
      throw new AuthError('User not found', 'NOT_FOUND')
    }

    const store = await this.repo.findStoreByOwnerId(userId)
    if (!store) {
      throw new AuthError('Store not found', 'NOT_FOUND')
    }

    return { user, store }
  }

  private async generateAndStoreTokens(userId: string, storeId: string): Promise<AuthTokens> {
    const accessToken = tokenService.signAccessToken({ sub: userId, storeId, role: 'owner' })
    const rawRefresh = tokenService.generateRefreshToken()
    const tokenHash = tokenService.hashToken(rawRefresh)
    const expiresAt = tokenService.refreshTokenExpiresAt()

    await this.repo.createRefreshToken({ userId, tokenHash, expiresAt })

    return { accessToken, refreshToken: rawRefresh }
  }
}
