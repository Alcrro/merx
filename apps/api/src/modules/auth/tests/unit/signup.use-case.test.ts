import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SignupUseCase } from '../../application/use-cases/signup.use-case'
import { makeAuthUser, makeAuthTokens, makeUserRepo, makePasswordHasher, makeSessionService } from '../fixtures/auth.fixtures'
import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IPasswordHasher } from '../../application/ports/password-hasher.port'
import type { SessionService } from '../../application/services/session.service'

describe('SignupUseCase', () => {
  let userRepo: IUserRepository
  let hasher: IPasswordHasher
  let session: SessionService
  let useCase: SignupUseCase

  beforeEach(() => {
    userRepo = makeUserRepo()
    hasher = makePasswordHasher()
    session = makeSessionService()
    useCase = new SignupUseCase(userRepo, hasher, session)
  })

  it('throws CONFLICT when email already registered', async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue({ ...makeAuthUser(), password: 'hash' })
    await expect(useCase.execute('test@example.com', 'password123')).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('hashes password, creates user without name, does not create store', async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
    vi.mocked(hasher.hash).mockResolvedValue('hashed-pw')
    vi.mocked(userRepo.createUser).mockResolvedValue(makeAuthUser())

    await useCase.execute('test@example.com', 'password123')

    expect(hasher.hash).toHaveBeenCalledWith('password123')
    expect(userRepo.createUser).toHaveBeenCalledWith(expect.objectContaining({ password: 'hashed-pw' }))
    expect(userRepo.createUser).toHaveBeenCalledWith(expect.not.objectContaining({ name: expect.anything() }))
  })

  it('generates session with empty storeId and user role', async () => {
    const user = makeAuthUser({ id: 'u1', role: 'user' })

    vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
    vi.mocked(hasher.hash).mockResolvedValue('hash')
    vi.mocked(userRepo.createUser).mockResolvedValue(user)

    await useCase.execute('test@example.com', 'password123')
    expect(session.generate).toHaveBeenCalledWith('u1', '', 'user')
  })

  it('returns tokens, user and store: null', async () => {
    const user = makeAuthUser()
    const tokens = makeAuthTokens()

    vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
    vi.mocked(hasher.hash).mockResolvedValue('hash')
    vi.mocked(userRepo.createUser).mockResolvedValue(user)
    vi.mocked(session.generate).mockResolvedValue(tokens)

    const result = await useCase.execute('test@example.com', 'password123')
    expect(result).toEqual({ tokens, user, store: null })
  })
})
