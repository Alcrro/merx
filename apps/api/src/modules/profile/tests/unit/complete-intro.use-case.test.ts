import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CompleteIntroUseCase } from '../../application/use-cases/complete-intro.use-case'
import { ProfileError } from '../../domain/errors'
import { makeUserIntro } from '../fixtures/profile.fixtures'
import type { IUserIntroRepository } from '../../domain/ports/user-intro.repository.port'

function makeIntroRepo(overrides: Partial<IUserIntroRepository> = {}): IUserIntroRepository {
  return {
    findByUserId: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    ...overrides,
  }
}

describe('CompleteIntroUseCase', () => {
  let introRepo: IUserIntroRepository
  let useCase: CompleteIntroUseCase

  beforeEach(() => {
    introRepo = makeIntroRepo()
    useCase = new CompleteIntroUseCase(introRepo)
  })

  it('auto-creates record and completes when no record exists', async () => {
    const created = makeUserIntro({ completed: false })
    vi.mocked(introRepo.findByUserId).mockResolvedValue(null)
    vi.mocked(introRepo.create).mockResolvedValue(created)
    vi.mocked(introRepo.save).mockResolvedValue(undefined)

    await useCase.execute('user-1', { name: 'Alex' })

    expect(introRepo.create).toHaveBeenCalledWith('user-1')
    expect(created.completed).toBe(true)
    expect(introRepo.save).toHaveBeenCalledWith(created, 'Alex')
  })

  it('returns early without saving when intro already completed', async () => {
    vi.mocked(introRepo.findByUserId).mockResolvedValue(makeUserIntro({ completed: true }))
    await useCase.execute('user-1', { name: 'Alex' })
    expect(introRepo.save).not.toHaveBeenCalled()
  })

  it('calls intro.complete() and saves when not yet completed', async () => {
    const intro = makeUserIntro({ completed: false })
    vi.mocked(introRepo.findByUserId).mockResolvedValue(intro)
    vi.mocked(introRepo.save).mockResolvedValue(undefined)

    await useCase.execute('user-1', { name: 'Alex' })

    expect(intro.completed).toBe(true)
    expect(introRepo.save).toHaveBeenCalledWith(intro, 'Alex')
  })

  it('throws ProfileError when save fails', async () => {
    vi.mocked(introRepo.findByUserId).mockResolvedValue(makeUserIntro({ completed: false }))
    vi.mocked(introRepo.save).mockRejectedValue(new Error('DB error'))
    await expect(useCase.execute('user-1', { name: 'Alex' })).rejects.toThrow('DB error')
  })
})
