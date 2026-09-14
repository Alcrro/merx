import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AuthRepository } from '../../infrastructure/db/repositories/auth.repository'
import { RefreshToken } from '../../domain/entities/refresh-token.entity'
import { prisma } from '../../../../lib/prisma'

const TEST_EMAIL = 'auth-integration@test.example.com'

async function cleanupTestUser(): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } })
  if (!user) return
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } })
  await prisma.store.deleteMany({ where: { ownerId: user.id } })
  await prisma.user.delete({ where: { id: user.id } })
}

describe('AuthRepository (integration)', () => {
  const repo = new AuthRepository()

  beforeEach(async () => {
    await cleanupTestUser()
  })

  afterEach(async () => {
    await cleanupTestUser()
  })

  describe('createUser / findUserByEmail / findUserById', () => {
    it('creates a user and finds it by email', async () => {
      const user = await repo.createUser({ email: TEST_EMAIL, password: 'hashed', name: 'Test' })

      expect(user.email).toBe(TEST_EMAIL)
      expect(user.name).toBe('Test')
      expect(user).not.toHaveProperty('password')

      const found = await repo.findUserByEmail(TEST_EMAIL)
      expect(found).not.toBeNull()
      expect(found!.id).toBe(user.id)
      expect(found!.password).toBe('hashed')
    })

    it('returns null when user not found by email', async () => {
      const result = await repo.findUserByEmail('nonexistent@example.com')
      expect(result).toBeNull()
    })

    it('finds user by id without exposing password', async () => {
      const user = await repo.createUser({ email: TEST_EMAIL, password: 'hashed' })

      const found = await repo.findUserById(user.id)
      expect(found).not.toBeNull()
      expect(found!.id).toBe(user.id)
      expect(found).not.toHaveProperty('password')
    })

    it('returns null when user not found by id', async () => {
      const result = await repo.findUserById('00000000-0000-0000-0000-000000000000')
      expect(result).toBeNull()
    })
  })

  describe('findStoreBySlug / findStoresByOwnerId', () => {
    it('finds store by slug and returns meta (ownerId, status)', async () => {
      const user = await repo.createUser({ email: TEST_EMAIL, password: 'hashed' })
      await prisma.store.create({ data: { ownerId: user.id, name: "Test's Store", slug: 'test-store-abc', currency: 'RON' } })

      const found = await repo.findStoreBySlug('test-store-abc')
      expect(found).not.toBeNull()
      expect(found!.slug).toBe('test-store-abc')
      expect(found!.ownerId).toBe(user.id)
      expect(found!.status).toBe('active')
    })

    it('returns null when slug does not exist', async () => {
      const result = await repo.findStoreBySlug('nonexistent-slug')
      expect(result).toBeNull()
    })

    it('finds all stores by ownerId', async () => {
      const user = await repo.createUser({ email: TEST_EMAIL, password: 'hashed' })
      await prisma.store.create({ data: { ownerId: user.id, name: 'Store A', slug: 'store-a-xyz', currency: 'RON' } })
      await prisma.store.create({ data: { ownerId: user.id, name: 'Store B', slug: 'store-b-xyz', currency: 'EUR' } })

      const stores = await repo.findStoresByOwnerId(user.id)
      expect(stores).toHaveLength(2)
      expect(stores.map(s => s.slug).sort()).toEqual(['store-a-xyz', 'store-b-xyz'])
    })

    it('returns empty array when user has no stores', async () => {
      const stores = await repo.findStoresByOwnerId('00000000-0000-0000-0000-000000000000')
      expect(stores).toEqual([])
    })
  })

  describe('refresh token operations', () => {
    it('creates and finds a refresh token as RefreshToken entity', async () => {
      const user = await repo.createUser({ email: TEST_EMAIL, password: 'hashed' })
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      await repo.createRefreshToken({ userId: user.id, tokenHash: 'test-hash', expiresAt })

      const token = await repo.findRefreshToken('test-hash')
      expect(token).not.toBeNull()
      expect(token).toBeInstanceOf(RefreshToken)
      expect(token!.userId).toBe(user.id)
      expect(token!.used).toBe(false)
      expect(token!.isExpired()).toBe(false)
      expect(token!.isReused()).toBe(false)
    })

    it('returns null for unknown token hash', async () => {
      const result = await repo.findRefreshToken('nonexistent-hash')
      expect(result).toBeNull()
    })

    it('marks refresh token as used', async () => {
      const user = await repo.createUser({ email: TEST_EMAIL, password: 'hashed' })
      await repo.createRefreshToken({
        userId: user.id,
        tokenHash: 'mark-used-hash',
        expiresAt: new Date(Date.now() + 10_000),
      })

      const before = await repo.findRefreshToken('mark-used-hash')
      expect(before!.isReused()).toBe(false)

      await repo.markRefreshTokenUsed(before!.id)

      const after = await repo.findRefreshToken('mark-used-hash')
      expect(after!.isReused()).toBe(true)
    })

    it('deletes a refresh token by hash', async () => {
      const user = await repo.createUser({ email: TEST_EMAIL, password: 'hashed' })
      await repo.createRefreshToken({
        userId: user.id,
        tokenHash: 'delete-hash',
        expiresAt: new Date(Date.now() + 10_000),
      })

      await repo.deleteRefreshToken('delete-hash', user.id)

      const result = await repo.findRefreshToken('delete-hash')
      expect(result).toBeNull()
    })

    it('deletes all refresh tokens for a user', async () => {
      const user = await repo.createUser({ email: TEST_EMAIL, password: 'hashed' })
      const expiresAt = new Date(Date.now() + 10_000)

      await repo.createRefreshToken({ userId: user.id, tokenHash: 'hash-1', expiresAt })
      await repo.createRefreshToken({ userId: user.id, tokenHash: 'hash-2', expiresAt })

      await repo.deleteAllUserRefreshTokens(user.id)

      const t1 = await repo.findRefreshToken('hash-1')
      const t2 = await repo.findRefreshToken('hash-2')
      expect(t1).toBeNull()
      expect(t2).toBeNull()
    })

    it('returns expired token with isExpired() true', async () => {
      const user = await repo.createUser({ email: TEST_EMAIL, password: 'hashed' })
      await repo.createRefreshToken({
        userId: user.id,
        tokenHash: 'expired-hash',
        expiresAt: new Date(Date.now() - 10_000),
      })

      const token = await repo.findRefreshToken('expired-hash')
      expect(token!.isExpired()).toBe(true)
    })
  })
})
