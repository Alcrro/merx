import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RefreshUseCase } from '../../application/use-cases/refresh.use-case'
import { makeAuthUser, makeAuthStoreWithMeta, makeRefreshTokenRepo, makeUserRepo, makeStoreRepo, makeTokenService, makeRefreshToken } from '../fixtures/auth.fixtures'
import type { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port'
import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IStoreRepository } from '../../domain/ports/store.repository.port'
import type { ITokenService } from '../../application/ports/token-service.port'

describe('RefreshUseCase', () => {
  let tokenRepo: IRefreshTokenRepository
  let userRepo: IUserRepository
  let storeRepo: IStoreRepository
  let tokens: ITokenService
  let useCase: RefreshUseCase

  beforeEach(() => {
    tokenRepo = makeRefreshTokenRepo()
    userRepo = makeUserRepo()
    storeRepo = makeStoreRepo()
    tokens = makeTokenService()
    useCase = new RefreshUseCase(tokenRepo, userRepo, storeRepo, tokens)
    vi.mocked(tokenRepo.rotateRefreshToken).mockResolvedValue(undefined)
    vi.mocked(tokenRepo.deleteAllUserRefreshTokens).mockResolvedValue(undefined)
  })

  it('throws UNAUTHORIZED when token not found', async () => {
    vi.mocked(tokenRepo.findRefreshToken).mockResolvedValue(null)
    await expect(useCase.execute('raw', 'my-store')).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('throws TOKEN_REUSE and deletes all user tokens when token is reused', async () => {
    vi.mocked(tokenRepo.findRefreshToken).mockResolvedValue(makeRefreshToken({ used: true, userId: 'u1' }))
    await expect(useCase.execute('raw', 'my-store')).rejects.toMatchObject({ code: 'TOKEN_REUSE' })
    expect(tokenRepo.deleteAllUserRefreshTokens).toHaveBeenCalledWith('u1')
  })

  it('throws UNAUTHORIZED when token is expired', async () => {
    vi.mocked(tokenRepo.findRefreshToken).mockResolvedValue(
      makeRefreshToken({ expiresAt: new Date(Date.now() - 10_000) })
    )
    await expect(useCase.execute('raw', 'my-store')).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('throws NOT_FOUND when store slug does not exist', async () => {
    vi.mocked(tokenRepo.findRefreshToken).mockResolvedValue(makeRefreshToken({ userId: 'u1' }))
    vi.mocked(storeRepo.findStoreBySlug).mockResolvedValue(null)
    await expect(useCase.execute('raw', 'missing-store')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('throws FORBIDDEN when store does not belong to token user', async () => {
    vi.mocked(tokenRepo.findRefreshToken).mockResolvedValue(makeRefreshToken({ userId: 'u1' }))
    vi.mocked(storeRepo.findStoreBySlug).mockResolvedValue(makeAuthStoreWithMeta({ ownerId: 'other-user' }))
    await expect(useCase.execute('raw', 'my-store')).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('throws FORBIDDEN when store is blocked', async () => {
    vi.mocked(tokenRepo.findRefreshToken).mockResolvedValue(makeRefreshToken({ userId: 'u1' }))
    vi.mocked(storeRepo.findStoreBySlug).mockResolvedValue(makeAuthStoreWithMeta({ ownerId: 'u1', status: 'blocked' }))
    await expect(useCase.execute('raw', 'my-store')).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('allows refresh when store is suspended', async () => {
    vi.mocked(tokenRepo.findRefreshToken).mockResolvedValue(makeRefreshToken({ id: 'tok1', userId: 'u1' }))
    vi.mocked(storeRepo.findStoreBySlug).mockResolvedValue(makeAuthStoreWithMeta({ id: 's1', ownerId: 'u1', status: 'suspended' }))
    vi.mocked(userRepo.findUserById).mockResolvedValue(makeAuthUser({ id: 'u1' }))
    vi.mocked(tokens.signStoreToken).mockReturnValue('at')
    vi.mocked(tokens.generateRefreshToken).mockReturnValue('rt')

    const result = await useCase.execute('raw', 'my-store')
    expect(result).toEqual({ accessToken: 'at', refreshToken: 'rt' })
    expect(tokens.signStoreToken).toHaveBeenCalledWith({ sub: 'u1', storeId: 's1', type: 'store' })
  })

  it('throws NOT_FOUND when user is missing', async () => {
    vi.mocked(tokenRepo.findRefreshToken).mockResolvedValue(makeRefreshToken({ userId: 'u1' }))
    vi.mocked(storeRepo.findStoreBySlug).mockResolvedValue(makeAuthStoreWithMeta({ ownerId: 'u1' }))
    vi.mocked(userRepo.findUserById).mockResolvedValue(null)
    await expect(useCase.execute('raw', 'my-store')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('signs storeToken with sub, storeId and type:store', async () => {
    vi.mocked(tokenRepo.findRefreshToken).mockResolvedValue(makeRefreshToken({ id: 'tok1', userId: 'u1' }))
    vi.mocked(storeRepo.findStoreBySlug).mockResolvedValue(makeAuthStoreWithMeta({ id: 's1', ownerId: 'u1' }))
    vi.mocked(userRepo.findUserById).mockResolvedValue(makeAuthUser({ id: 'u1' }))

    await useCase.execute('raw', 'my-store')

    expect(tokens.signStoreToken).toHaveBeenCalledWith({ sub: 'u1', storeId: 's1', type: 'store' })
  })

  it('rotates token atomically — calls rotateRefreshToken not markUsed', async () => {
    vi.mocked(tokenRepo.findRefreshToken).mockResolvedValue(makeRefreshToken({ id: 'tok1', userId: 'u1' }))
    vi.mocked(storeRepo.findStoreBySlug).mockResolvedValue(makeAuthStoreWithMeta({ ownerId: 'u1' }))
    vi.mocked(userRepo.findUserById).mockResolvedValue(makeAuthUser({ id: 'u1' }))
    vi.mocked(tokens.hashToken).mockReturnValue('new-hash')
    vi.mocked(tokens.refreshTokenExpiresAt).mockReturnValue(new Date('2027-01-01'))

    await useCase.execute('raw', 'my-store')

    expect(tokenRepo.rotateRefreshToken).toHaveBeenCalledWith('tok1', {
      userId: 'u1',
      tokenHash: 'new-hash',
      expiresAt: new Date('2027-01-01'),
    })
    expect(tokenRepo.markRefreshTokenUsed).not.toHaveBeenCalled()
  })

  it('returns accessToken (store-scoped) and raw refreshToken', async () => {
    vi.mocked(tokenRepo.findRefreshToken).mockResolvedValue(makeRefreshToken({ userId: 'u1' }))
    vi.mocked(storeRepo.findStoreBySlug).mockResolvedValue(makeAuthStoreWithMeta({ ownerId: 'u1' }))
    vi.mocked(userRepo.findUserById).mockResolvedValue(makeAuthUser())
    vi.mocked(tokens.signStoreToken).mockReturnValue('new-at')
    vi.mocked(tokens.generateRefreshToken).mockReturnValue('new-rt')

    const result = await useCase.execute('raw', 'my-store')
    expect(result).toEqual({ accessToken: 'new-at', refreshToken: 'new-rt' })
  })
})
