import { describe, it, expect } from 'vitest'
import { userIntroMapper } from '../../infrastructure/db/mappers/user-intro.mapper'
import { UserIntro } from '../../domain/entities/user-intro.entity'

describe('userIntroMapper', () => {
  describe('toDomain', () => {
    it('maps incomplete record to UserIntro entity', () => {
      const record = { userId: 'user-1', completed: false, completedAt: null }
      const intro = userIntroMapper.toDomain(record)
      expect(intro).toBeInstanceOf(UserIntro)
      expect(intro.userId).toBe('user-1')
      expect(intro.completed).toBe(false)
      expect(intro.completedAt).toBeNull()
    })

    it('maps completed record with completedAt', () => {
      const date = new Date('2026-08-22T10:00:00Z')
      const record = { userId: 'user-2', completed: true, completedAt: date }
      const intro = userIntroMapper.toDomain(record)
      expect(intro.completed).toBe(true)
      expect(intro.completedAt).toBe(date)
    })
  })
})
