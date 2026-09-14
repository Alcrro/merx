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
    vi.mocked(repo.deleteRefreshToken).mockResolvedValue(undefined)
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
