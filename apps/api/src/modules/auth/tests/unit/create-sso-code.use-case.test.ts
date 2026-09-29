import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateSsoCodeUseCase } from '../../application/use-cases/create-sso-code.use-case'
import { makeAuthUser, makeUserRepo, makeTokenService } from '../fixtures/auth.fixtures'
import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { ITokenService } from '../../application/ports/token-service.port'

describe('CreateSsoCodeUseCase', () => {
  let userRepo: IUserRepository
  let tokens: ITokenService
  let useCase: CreateSsoCodeUseCase

  beforeEach(() => {
    userRepo = makeUserRepo()
    tokens = makeTokenService()
    useCase = new CreateSsoCodeUseCase(userRepo, tokens)
    vi.mocked(userRepo.setSsoCode).mockResolvedValue(undefined)
  })

  it('throws UNAUTHORIZED when user does not exist', async () => {
    vi.mocked(userRepo.findUserById).mockResolvedValue(null)
    await expect(useCase.execute('u1')).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    expect(userRepo.setSsoCode).not.toHaveBeenCalled()
  })

  it('stores a code for the authenticated user only, expiring in 60s', async () => {
    vi.mocked(userRepo.findUserById).mockResolvedValue(makeAuthUser({ id: 'u1' }))
    vi.mocked(tokens.generateRefreshToken).mockReturnValue('sso-code')
    const before = Date.now()

    const result = await useCase.execute('u1')

    expect(result).toEqual({ code: 'sso-code' })
    expect(userRepo.findUserById).toHaveBeenCalledWith('u1')
    const [userId, code, expiresAt] = vi.mocked(userRepo.setSsoCode).mock.calls[0]
    expect(userId).toBe('u1')
    expect(code).toBe('sso-code')
    expect(expiresAt.getTime() - before).toBeGreaterThanOrEqual(60_000)
    expect(expiresAt.getTime() - before).toBeLessThan(61_000)
  })
})
