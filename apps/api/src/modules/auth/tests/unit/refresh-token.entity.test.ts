import { describe, it, expect } from 'vitest'
import { makeRefreshToken } from '../fixtures/auth.fixtures'

describe('RefreshToken', () => {
  describe('isExpired', () => {
    it('returns false when token expires in the future', () => {
      const token = makeRefreshToken({ expiresAt: new Date(Date.now() + 10_000) })
      expect(token.isExpired()).toBe(false)
    })

    it('returns true when token expired in the past', () => {
      const token = makeRefreshToken({ expiresAt: new Date(Date.now() - 10_000) })
      expect(token.isExpired()).toBe(true)
    })
  })

  describe('isReused', () => {
    it('returns false when token is not used', () => {
      const token = makeRefreshToken({ used: false })
      expect(token.isReused()).toBe(false)
    })

    it('returns true when token is already used', () => {
      const token = makeRefreshToken({ used: true })
      expect(token.isReused()).toBe(true)
    })
  })
})
