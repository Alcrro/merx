import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MeQuery } from '../../application/queries/me.query'
import { makeAuthUser, makeAuthStore, makeUserRepo, makeStoreRepo } from '../fixtures/auth.fixtures'
import type { IUserRepository } from '../../domain/ports/user.repository.port'
import type { IStoreRepository } from '../../domain/ports/store.repository.port'

describe('MeQuery', () => {
  let userRepo: IUserRepository
  let storeRepo: IStoreRepository
  let query: MeQuery

  beforeEach(() => {
    userRepo = makeUserRepo()
    storeRepo = makeStoreRepo()
    query = new MeQuery(userRepo, storeRepo)
  })

  it('throws NOT_FOUND when user missing', async () => {
    vi.mocked(userRepo.findUserById).mockResolvedValue(null)
    await expect(query.execute('user1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('returns empty stores array when user has no stores', async () => {
    vi.mocked(userRepo.findUserById).mockResolvedValue(makeAuthUser())
    vi.mocked(storeRepo.findStoresByOwnerId).mockResolvedValue([])
    const result = await query.execute('user1')
    expect(result).toEqual({ user: makeAuthUser(), stores: [] })
  })

  it('returns user and stores', async () => {
    const user = makeAuthUser()
    const store = makeAuthStore()
    vi.mocked(userRepo.findUserById).mockResolvedValue(user)
    vi.mocked(storeRepo.findStoresByOwnerId).mockResolvedValue([store])

    const result = await query.execute('user1')
    expect(result).toEqual({ user, stores: [store] })
  })

  it('looks up stores by the correct userId', async () => {
    vi.mocked(userRepo.findUserById).mockResolvedValue(makeAuthUser({ id: 'u42' }))
    vi.mocked(storeRepo.findStoresByOwnerId).mockResolvedValue([])

    await query.execute('u42')
    expect(storeRepo.findStoresByOwnerId).toHaveBeenCalledWith('u42')
  })
})
