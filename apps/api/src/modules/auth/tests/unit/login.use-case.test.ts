import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginUseCase } from '../../application/use-cases/login.use-case'
import { makeAuthUser, makeAuthStore, makeAuthTokens, makeUserRepo, makeStoreRepo, makePasswordHasher, makeSessionService } from '../fixtures/auth.fixtures'
import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IStoreRepository } from '../../domain/ports/store.repository.port'
import type { IPasswordHasher } from '../../application/ports/password-hasher.port'
import type { SessionService } from '../../application/services/session.service'

describe('LoginUseCase', () => {
  let userRepo: IUserRepository
  let storeRepo: IStoreRepository
  let hasher: IPasswordHasher
  let session: SessionService
  let useCase: LoginUseCase

  beforeEach(() => {
    userRepo = makeUserRepo()
    storeRepo = makeStoreRepo()
    hasher = makePasswordHasher()
    session = makeSessionService()
    useCase = new LoginUseCase(userRepo, storeRepo, hasher, session)
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

  it('throws NOT_FOUND when store missing', async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue({ ...makeAuthUser(), password: 'hash' })
    vi.mocked(hasher.compare).mockResolvedValue(true)
    vi.mocked(storeRepo.findStoreByOwnerId).mockResolvedValue(null)
    await expect(useCase.execute('test@example.com', 'pass')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('returns tokens, user without password, and store', async () => {
    const user = makeAuthUser()
    const store = makeAuthStore()
    const tokens = makeAuthTokens()

    vi.mocked(userRepo.findUserByEmail).mockResolvedValue({ ...user, password: 'hash' })
    vi.mocked(hasher.compare).mockResolvedValue(true)
    vi.mocked(storeRepo.findStoreByOwnerId).mockResolvedValue(store)
    vi.mocked(session.generate).mockResolvedValue(tokens)

    const result = await useCase.execute('test@example.com', 'pass')
    expect(result).toEqual({ tokens, user, store })
    expect(result.user).not.toHaveProperty('password')
  })

  it('generates session with userId, storeId and real role', async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue({ ...makeAuthUser({ id: 'u1', role: 'owner' }), password: 'hash' })
    vi.mocked(hasher.compare).mockResolvedValue(true)
    vi.mocked(storeRepo.findStoreByOwnerId).mockResolvedValue(makeAuthStore({ id: 's1' }))

    await useCase.execute('test@example.com', 'pass')
    expect(session.generate).toHaveBeenCalledWith('u1', 's1', 'owner')
  })
})
