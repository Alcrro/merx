import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SessionService } from '../../application/services/session.service'
import { makeRefreshTokenRepo, makeTokenService } from '../fixtures/auth.fixtures'
import type { IRefreshTokenRepository } from '../../domain/ports/refresh-token.repository.port'
import type { ITokenService } from '../../application/ports/token-service.port'

describe('SessionService', () => {
  let repo: IRefreshTokenRepository
  let tokenSvc: ITokenService
  let service: SessionService

  beforeEach(() => {
    repo = makeRefreshTokenRepo()
    tokenSvc = makeTokenService()
    service = new SessionService(repo, tokenSvc)
    vi.mocked(repo.createRefreshToken).mockResolvedValue(undefined)
    vi.mocked(repo.deleteRefreshToken).mockResolvedValue(undefined)
  })

  describe('generate', () => {
    it('stores hashed refresh token in repo', async () => {
      vi.mocked(tokenSvc.generateRefreshToken).mockReturnValue('raw-rt')
      vi.mocked(tokenSvc.hashToken).mockReturnValue('hashed-rt')
      vi.mocked(tokenSvc.refreshTokenExpiresAt).mockReturnValue(new Date('2026-12-31'))

      await service.generate('user1', 'store1', 'owner')

      expect(repo.createRefreshToken).toHaveBeenCalledWith({
        userId: 'user1',
        tokenHash: 'hashed-rt',
        expiresAt: new Date('2026-12-31'),
      })
    })

    it('returns accessToken and raw refreshToken', async () => {
      vi.mocked(tokenSvc.signAccessToken).mockReturnValue('at')
      vi.mocked(tokenSvc.generateRefreshToken).mockReturnValue('raw-rt')
      vi.mocked(tokenSvc.hashToken).mockReturnValue('hash')
      vi.mocked(tokenSvc.refreshTokenExpiresAt).mockReturnValue(new Date())

      const result = await service.generate('user1', 'store1', 'owner')
      expect(result).toEqual({ accessToken: 'at', refreshToken: 'raw-rt' })
    })

    it('signs access token with correct payload including role', async () => {
      await service.generate('u1', 's1', 'owner')
      expect(tokenSvc.signAccessToken).toHaveBeenCalledWith({ sub: 'u1', storeId: 's1', role: 'owner' })
    })

    it('passes role to access token payload', async () => {
      await service.generate('u1', 's1', 'member')
      expect(tokenSvc.signAccessToken).toHaveBeenCalledWith({ sub: 'u1', storeId: 's1', role: 'member' })
    })
  })

  describe('revoke', () => {
    it('hashes token and deletes from repo with userId', async () => {
      vi.mocked(tokenSvc.hashToken).mockReturnValue('hashed')

      await service.revoke('raw-token', 'user1')

      expect(tokenSvc.hashToken).toHaveBeenCalledWith('raw-token')
      expect(repo.deleteRefreshToken).toHaveBeenCalledWith('hashed', 'user1')
    })
  })
})
