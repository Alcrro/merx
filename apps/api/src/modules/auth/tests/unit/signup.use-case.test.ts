import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SignupUseCase } from '../../application/use-cases/signup.use-case'
import { makeAuthUser, makeUserRepo, makeRefreshTokenRepo, makePasswordHasher, makeTokenService } from '../fixtures/auth.fixtures'
import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port'
import type { IEmailVerificationRepository } from '../../domain/ports/email-verification.repository.port'
import type { IPasswordHasher } from '../../application/ports/password-hasher.port'
import type { ITokenService } from '../../application/ports/token-service.port'
import type { IEmailService } from '../../application/ports/email-service.port'

function makeVerifyRepo(): IEmailVerificationRepository {
  return {
    createEmailVerificationToken: vi.fn().mockResolvedValue(undefined),
    findEmailVerificationToken: vi.fn(),
    markEmailVerificationTokenUsed: vi.fn(),
    deleteEmailVerificationTokens: vi.fn(),
  }
}

function makeEmailService(): IEmailService {
  return {
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
    sendEmailVerificationEmail: vi.fn().mockResolvedValue(undefined),
  }
}

describe('SignupUseCase', () => {
  let userRepo: IUserRepository
  let tokenRepo: IRefreshTokenRepository
  let hasher: IPasswordHasher
  let tokens: ITokenService
  let verifyRepo: IEmailVerificationRepository
  let emailService: IEmailService
  let useCase: SignupUseCase

  beforeEach(() => {
    userRepo = makeUserRepo()
    tokenRepo = makeRefreshTokenRepo()
    hasher = makePasswordHasher()
    tokens = makeTokenService()
    verifyRepo = makeVerifyRepo()
    emailService = makeEmailService()
    useCase = new SignupUseCase(userRepo, tokenRepo, hasher, tokens, verifyRepo, emailService)
    vi.mocked(tokenRepo.createRefreshToken).mockResolvedValue(undefined)
  })

  it('throws CONFLICT when email already registered', async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue({ ...makeAuthUser(), password: 'hash' })
    await expect(useCase.execute('test@example.com', 'password123')).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('hashes password and creates user', async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
    vi.mocked(hasher.hash).mockResolvedValue('hashed-pw')
    vi.mocked(userRepo.createUser).mockResolvedValue(makeAuthUser())

    await useCase.execute('test@example.com', 'password123')

    expect(hasher.hash).toHaveBeenCalledWith('password123')
    expect(userRepo.createUser).toHaveBeenCalledWith(expect.objectContaining({ password: 'hashed-pw' }))
  })

  it('returns platformToken, refreshToken and user', async () => {
    const user = makeAuthUser({ id: 'u1' })
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
    vi.mocked(hasher.hash).mockResolvedValue('hash')
    vi.mocked(userRepo.createUser).mockResolvedValue(user)
    vi.mocked(tokens.signPlatformToken).mockReturnValue('pt')
    vi.mocked(tokens.generateRefreshToken).mockReturnValue('raw-rt')

    const result = await useCase.execute('test@example.com', 'password123')
    expect(result).toEqual({ platformToken: 'pt', refreshToken: 'raw-rt', user })
  })

  it('signs platformToken with sub and type:platform', async () => {
    const user = makeAuthUser({ id: 'u1' })
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null)
    vi.mocked(hasher.hash).mockResolvedValue('hash')
    vi.mocked(userRepo.createUser).mockResolvedValue(user)

    await useCase.execute('test@example.com', 'password123')
    expect(tokens.signPlatformToken).toHaveBeenCalledWith({ sub: 'u1', type: 'platform' })
  })
})
