import { vi } from 'vitest'
import { RefreshToken } from '../../domain/entities/refresh-token.entity'
import type { AuthUser, AuthStore, AuthTokens } from '../../domain/types'
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
    role: 'owner',
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
  }
}

export function makeStoreRepo(): IStoreRepository {
  return {
    findStoreByOwnerId: vi.fn(),
    createStore: vi.fn(),
  }
}

export function makeRefreshTokenRepo(): IRefreshTokenRepository {
  return {
    findRefreshToken: vi.fn(),
    createRefreshToken: vi.fn(),
    rotateRefreshToken: vi.fn(),
    markRefreshTokenUsed: vi.fn(),
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
    signAccessToken: vi.fn().mockReturnValue('access-token'),
    verifyAccessToken: vi.fn(),
    generateRefreshToken: vi.fn().mockReturnValue('raw-refresh-token'),
    hashToken: vi.fn().mockReturnValue('hashed-token'),
    refreshTokenExpiresAt: vi.fn().mockReturnValue(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  }
}

export function makeSessionService(): SessionService {
  return {
    generate: vi.fn().mockResolvedValue(makeAuthTokens()),
    revoke: vi.fn().mockResolvedValue(undefined),
  } as unknown as SessionService
}
