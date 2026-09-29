import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GoogleSignInUseCase } from '../../application/use-cases/google-sign-in.use-case'
import { makeAuthUser, makeAuthStore, makeUserRepo, makeStoreRepo, makeRefreshTokenRepo, makeTokenService } from '../fixtures/auth.fixtures'
import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IStoreRepository } from '../../domain/ports/store.repository.port'
import type { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port'
import type { ITokenService } from '../../application/ports/token-service.port'
import type { GoogleIdentity, IGoogleIdentityProvider } from '../../application/ports/google-identity.port'
import type { GoogleSignInCandidate } from '../../domain/types'

function makeIdentity(overrides: Partial<GoogleIdentity> = {}): GoogleIdentity {
  return {
    googleId: 'g-123',
    email: 'Test@Example.com',
    emailVerified: true,
    name: 'Test User',
    avatarUrl: 'https://img/avatar.png',
    ...overrides,
  }
}

function makeCandidate(overrides: Partial<GoogleSignInCandidate> = {}): GoogleSignInCandidate {
  return { ...makeAuthUser({ id: 'u1' }), googleId: null, hasPassword: true, deleted: false, ...overrides }
}

describe('GoogleSignInUseCase', () => {
  let userRepo: IUserRepository
  let storeRepo: IStoreRepository
  let tokenRepo: IRefreshTokenRepository
  let tokens: ITokenService
  let google: IGoogleIdentityProvider
  let useCase: GoogleSignInUseCase

  beforeEach(() => {
    userRepo = makeUserRepo()
    storeRepo = makeStoreRepo()
    tokenRepo = makeRefreshTokenRepo()
    tokens = makeTokenService()
    google = { exchangeCode: vi.fn().mockResolvedValue(makeIdentity()) }
    useCase = new GoogleSignInUseCase(userRepo, storeRepo, tokenRepo, google, tokens)
    vi.mocked(storeRepo.findStoresByOwnerId).mockResolvedValue([makeAuthStore()])
    vi.mocked(tokenRepo.createRefreshToken).mockResolvedValue(undefined)
  })

  it('rejects unverified Google emails without touching accounts', async () => {
    vi.mocked(google.exchangeCode).mockResolvedValue(makeIdentity({ emailVerified: false }))
    await expect(useCase.execute('code')).rejects.toMatchObject({ code: 'FORBIDDEN' })
    expect(userRepo.findUserForGoogleSignIn).not.toHaveBeenCalled()
    expect(tokenRepo.createRefreshToken).not.toHaveBeenCalled()
  })

  it('creates a new Google user with a lowercased email when no account matches', async () => {
    vi.mocked(userRepo.findUserForGoogleSignIn).mockResolvedValue(null)
    vi.mocked(userRepo.createGoogleUser).mockResolvedValue(makeAuthUser({ id: 'new', emailVerified: true }))

    const result = await useCase.execute('code')

    expect(userRepo.findUserForGoogleSignIn).toHaveBeenCalledWith('g-123', 'test@example.com')
    expect(userRepo.createGoogleUser).toHaveBeenCalledWith({
      email: 'test@example.com', googleId: 'g-123', name: 'Test User', avatarUrl: 'https://img/avatar.png',
    })
    expect(result.user.id).toBe('new')
    expect(tokens.signPlatformToken).toHaveBeenCalledWith({ sub: 'new', type: 'platform' })
  })

  it('signs in an already linked account without relinking', async () => {
    vi.mocked(userRepo.findUserForGoogleSignIn).mockResolvedValue(makeCandidate({ googleId: 'g-123' }))

    const result = await useCase.execute('code')

    expect(userRepo.linkGoogleAccount).not.toHaveBeenCalled()
    expect(tokenRepo.deleteAllUserRefreshTokens).not.toHaveBeenCalled()
    expect(result.user).not.toHaveProperty('hasPassword')
    expect(result.user.id).toBe('u1')
  })

  it('links a verified password account and keeps its password', async () => {
    vi.mocked(userRepo.findUserForGoogleSignIn).mockResolvedValue(makeCandidate({ emailVerified: true }))

    await useCase.execute('code')

    expect(userRepo.linkGoogleAccount).toHaveBeenCalledWith('u1', 'g-123', { clearPassword: false })
    expect(tokenRepo.deleteAllUserRefreshTokens).not.toHaveBeenCalled()
  })

  it('pre-hijack: linking an unverified password account clears the password and revokes all sessions', async () => {
    vi.mocked(userRepo.findUserForGoogleSignIn).mockResolvedValue(makeCandidate({ emailVerified: false, hasPassword: true }))

    const result = await useCase.execute('code')

    expect(userRepo.linkGoogleAccount).toHaveBeenCalledWith('u1', 'g-123', { clearPassword: true })
    expect(tokenRepo.deleteAllUserRefreshTokens).toHaveBeenCalledWith('u1')
    expect(result.user.emailVerified).toBe(true)
  })

  it('rejects when the email is linked to a different Google account', async () => {
    vi.mocked(userRepo.findUserForGoogleSignIn).mockResolvedValue(makeCandidate({ googleId: 'g-other' }))
    await expect(useCase.execute('code')).rejects.toMatchObject({ code: 'FORBIDDEN' })
    expect(tokenRepo.createRefreshToken).not.toHaveBeenCalled()
  })

  it('rejects deleted accounts', async () => {
    vi.mocked(userRepo.findUserForGoogleSignIn).mockResolvedValue(makeCandidate({ googleId: 'g-123', deleted: true }))
    await expect(useCase.execute('code')).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('stores a hashed refresh token with request meta and returns stores + avatar', async () => {
    vi.mocked(userRepo.findUserForGoogleSignIn).mockResolvedValue(makeCandidate({ googleId: 'g-123' }))

    const result = await useCase.execute('code', { userAgent: 'UA', ip: '1.2.3.4' })

    expect(tokenRepo.createRefreshToken).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'u1', tokenHash: 'hashed-token', userAgent: 'UA', ip: '1.2.3.4',
    }))
    expect(result).toMatchObject({ refreshToken: 'raw-refresh-token', avatarUrl: 'https://img/avatar.png' })
    expect(result.stores).toHaveLength(1)
  })
})
