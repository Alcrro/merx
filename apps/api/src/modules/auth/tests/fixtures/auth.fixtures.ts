import { vi } from 'vitest'
import { RefreshToken } from '../../domain/entities/refresh-token.entity'
import type { AuthUser, AuthStore, AuthTokens, AuthStoreWithMeta } from '../../domain/types'
import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IStoreRepository } from '../../domain/ports/store.repository.port'
import type { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port'
import type { IPasswordHasher } from '../../application/ports/password-hasher.port'
import type { ITokenService } from '../../application/ports/token-service.port'
import type { SessionService } from '../../application/services/session.service'

export function makeAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user1',
    email: 'test@example.com',
    name: 'Test User',
    platformRole: 'user',
    emailVerified: false,
    createdAt: new Date('2026-01-01T10:00:00Z'),
    ...overrides,
  }
}

export function makeAuthStore(overrides: Partial<AuthStore> = {}): AuthStore {
  return {
    id: 'store1',
    name: "Test User's Store",
    slug: 'test-user-abc12',
    currency: 'RON',
    ...overrides,
  }
}

export function makeAuthStoreWithMeta(overrides: Partial<AuthStoreWithMeta> = {}): AuthStoreWithMeta {
  return {
    id: 'store1',
    name: "Test User's Store",
    slug: 'test-user-abc12',
    currency: 'RON',
    ownerId: 'user1',
    status: 'active',
    ...overrides,
  }
}

export function makeAuthTokens(overrides: Partial<AuthTokens> = {}): AuthTokens {
  return {
    accessToken: 'access-token',
    refreshToken: 'raw-refresh-token',
    ...overrides,
  }
}

export function makeRefreshToken(overrides: Partial<{
  id: string
  userId: string
  expiresAt: Date
  used: boolean
}> = {}): RefreshToken {
  return new RefreshToken(
    overrides.id ?? 'token1',
    overrides.userId ?? 'user1',
    overrides.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    overrides.used ?? false,
  )
}

export function makeUserRepo(): IUserRepository {
  return {
    findUserByEmail: vi.fn(),
    findUserById: vi.fn(),
    createUser: vi.fn(),
    findUserForGoogleSignIn: vi.fn(),
    createGoogleUser: vi.fn(),
    linkGoogleAccount: vi.fn(),
    setSsoCode: vi.fn(),
    consumeSsoCode: vi.fn(),
    updateUserPassword: vi.fn(),
    updateEmailVerified: vi.fn(),
  }
}

export function makeStoreRepo(): IStoreRepository {
  return {
    findStoreBySlug: vi.fn(),
    findStoresByOwnerId: vi.fn(),
  }
}

export function makeRefreshTokenRepo(): IRefreshTokenRepository {
  return {
    findRefreshToken: vi.fn(),
    createRefreshToken: vi.fn(),
    rotateRefreshToken: vi.fn(),
    markRefreshTokenUsed: vi.fn(),
    extendRefreshToken: vi.fn(),
    deleteRefreshToken: vi.fn(),
    deleteAllUserRefreshTokens: vi.fn(),
  }
}

export function makePasswordHasher(): IPasswordHasher {
  return {
    hash: vi.fn(),
    compare: vi.fn(),
  }
}

export function makeTokenService(): ITokenService {
  return {
    signPlatformToken: vi.fn().mockReturnValue('platform-token'),
    signStoreToken: vi.fn().mockReturnValue('store-token'),
    verifyToken: vi.fn(),
    generateRefreshToken: vi.fn().mockReturnValue('raw-refresh-token'),
    hashToken: vi.fn().mockReturnValue('hashed-token'),
    refreshTokenExpiresAt: vi.fn().mockReturnValue(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  }
}

export function makeSessionService(): SessionService {
  return {
    revoke: vi.fn().mockResolvedValue(undefined),
  } as unknown as SessionService
}
