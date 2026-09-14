import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginUseCase } from '../../application/use-cases/login.use-case'
import { makeAuthUser, makeAuthStore, makeUserRepo, makeStoreRepo, makeRefreshTokenRepo, makePasswordHasher, makeTokenService } from '../fixtures/auth.fixtures'
import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IStoreRepository } from '../../domain/ports/store.repository.port'
import type { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port'
import type { IPasswordHasher } from '../../application/ports/password-hasher.port'
import type { ITokenService } from '../../application/ports/token-service.port'

describe('LoginUseCase', () => {
  let userRepo: IUserRepository
  let storeRepo: IStoreRepository
  let tokenRepo: IRefreshTokenRepository
  let hasher: IPasswordHasher
  let tokens: ITokenService
  let useCase: LoginUseCase

  beforeEach(() => {
    userRepo = makeUserRepo()
    storeRepo = makeStoreRepo()
    tokenRepo = makeRefreshTokenRepo()
    hasher = makePasswordHasher()
    tokens = makeTokenService()
    useCase = new LoginUseCase(userRepo, storeRepo, tokenRepo, hasher, tokens)
    vi.mocked(tokenRepo.createRefreshToken).mockResolvedValue(undefined)
  })

  it('throws UNAUTHORIZED when user not found', async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
    await expect(useCase.execute('x@x.com', 'pass')).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('throws UNAUTHORIZED when password is wrong', async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue({ ...makeAuthUser(), password: 'hash' })
    vi.mocked(hasher.compare).mockResolvedValue(false)
    await expect(useCase.execute('test@example.com', 'wrong')).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('returns platformToken, refreshToken, user without password, and stores', async () => {
    const user = makeAuthUser()
    const store = makeAuthStore()
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue({ ...user, password: 'hash' })
    vi.mocked(hasher.compare).mockResolvedValue(true)
    vi.mocked(storeRepo.findStoresByOwnerId).mockResolvedValue([store])
    vi.mocked(tokens.signPlatformToken).mockReturnValue('pt')
    vi.mocked(tokens.generateRefreshToken).mockReturnValue('raw-rt')

    const result = await useCase.execute('test@example.com', 'pass')
    expect(result).toEqual({ platformToken: 'pt', refreshToken: 'raw-rt', user, stores: [store] })
    expect(result.user).not.toHaveProperty('password')
  })

  it('returns empty stores array when user has no stores', async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue({ ...makeAuthUser(), password: 'hash' })
    vi.mocked(hasher.compare).mockResolvedValue(true)
    vi.mocked(storeRepo.findStoresByOwnerId).mockResolvedValue([])

    const result = await useCase.execute('test@example.com', 'pass')
    expect(result.stores).toEqual([])
  })

  it('signs platformToken with sub and type:platform', async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue({ ...makeAuthUser({ id: 'u1' }), password: 'hash' })
    vi.mocked(hasher.compare).mockResolvedValue(true)
    vi.mocked(storeRepo.findStoresByOwnerId).mockResolvedValue([])

    await useCase.execute('test@example.com', 'pass')
    expect(tokens.signPlatformToken).toHaveBeenCalledWith({ sub: 'u1', type: 'platform' })
  })

  it('never signs a store-scoped token at login', async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue({ ...makeAuthUser(), password: 'hash' })
    vi.mocked(hasher.compare).mockResolvedValue(true)
    vi.mocked(storeRepo.findStoresByOwnerId).mockResolvedValue([makeAuthStore()])

    await useCase.execute('test@example.com', 'pass')
    expect(tokens.signStoreToken).not.toHaveBeenCalled()
  })

  it('stores refresh token as hash, not raw', async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue({ ...makeAuthUser({ id: 'u1' }), password: 'hash' })
    vi.mocked(hasher.compare).mockResolvedValue(true)
    vi.mocked(storeRepo.findStoresByOwnerId).mockResolvedValue([])
    vi.mocked(tokens.generateRefreshToken).mockReturnValue('raw-rt')
    vi.mocked(tokens.hashToken).mockReturnValue('hashed-rt')
    const expiresAt = new Date('2027-01-01')
    vi.mocked(tokens.refreshTokenExpiresAt).mockReturnValue(expiresAt)

    await useCase.execute('test@example.com', 'pass')
    expect(tokens.hashToken).toHaveBeenCalledWith('raw-rt')
    expect(tokenRepo.createRefreshToken).toHaveBeenCalledWith({ userId: 'u1', tokenHash: 'hashed-rt', expiresAt })
  })

  it('fetches stores by the authenticated user id', async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue({ ...makeAuthUser({ id: 'u1' }), password: 'hash' })
    vi.mocked(hasher.compare).mockResolvedValue(true)
    vi.mocked(storeRepo.findStoresByOwnerId).mockResolvedValue([])

    await useCase.execute('test@example.com', 'pass')
    expect(storeRepo.findStoresByOwnerId).toHaveBeenCalledWith('u1')
  })
})
