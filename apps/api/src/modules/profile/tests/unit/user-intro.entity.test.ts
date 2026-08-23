import { describe, it, expect, beforeEach } from 'vitest'
import { UserIntro } from '../../domain/entities/user-intro.entity'
import { ProfileError } from '../../domain/errors'
import { makeUserIntro } from '../fixtures/profile.fixtures'

describe('UserIntro', () => {
  describe('create', () => {
    it('creates intro with completed=false and no completedAt', () => {
      const intro = UserIntro.create('user-1')
      expect(intro.userId).toBe('user-1')
      expect(intro.completed).toBe(false)
      expect(intro.completedAt).toBeNull()
    })
  })

  describe('reconstitute', () => {
    it('restores state from persistence', () => {
      const date = new Date('2026-01-01')
      const intro = UserIntro.reconstitute('user-1', true, date)
      expect(intro.completed).toBe(true)
      expect(intro.completedAt).toBe(date)
    })
  })

  describe('complete', () => {
    let intro: UserIntro

    beforeEach(() => {
      intro = makeUserIntro({ completed: false })
    })

    it('sets completed to true', () => {
      intro.complete()
      expect(intro.completed).toBe(true)
    })

    it('sets completedAt to current time', () => {
      const before = new Date()
      intro.complete()
      const after = new Date()
      expect(intro.completedAt).not.toBeNull()
      expect(intro.completedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(intro.completedAt!.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('throws ProfileError.alreadyCompleted when called twice', () => {
      intro.complete()
      expect(() => intro.complete()).toThrow(ProfileError)
      expect(() => makeUserIntro({ completed: true }).complete()).toThrow(ProfileError)
    })

    it('thrown error has code INTRO_ALREADY_COMPLETED', () => {
      intro.complete()
      try {
        intro.complete()
      } catch (err) {
        expect(err).toBeInstanceOf(ProfileError)
        expect((err as ProfileError).code).toBe('INTRO_ALREADY_COMPLETED')
      }
    })
  })
})
