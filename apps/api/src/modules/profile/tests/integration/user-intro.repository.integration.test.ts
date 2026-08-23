import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { UserIntroRepository } from '../../infrastructure/db/repositories/user-intro.repository'
import { UserIntro } from '../../domain/entities/user-intro.entity'
import { prisma } from '../../../../lib/prisma'

const TEST_EMAIL = 'profile-integration@test.example.com'

async function createTestUser(): Promise<string> {
  const user = await prisma.user.create({
    data: { email: TEST_EMAIL, password: 'hashed' },
    select: { id: true },
  })
  return user.id
}

async function cleanup(): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } })
  if (!user) return
  await prisma.userIntro.deleteMany({ where: { userId: user.id } })
  await prisma.user.delete({ where: { id: user.id } })
}

describe('UserIntroRepository (integration)', () => {
  const repo = new UserIntroRepository(prisma)
  let userId: string

  beforeEach(async () => {
    await cleanup()
    userId = await createTestUser()
  })

  afterEach(async () => {
    await cleanup()
  })

  describe('findByUserId', () => {
    it('returns null when intro does not exist', async () => {
      const result = await repo.findByUserId(userId)
      expect(result).toBeNull()
    })

    it('returns UserIntro entity when intro exists', async () => {
      await repo.create(userId)
      const result = await repo.findByUserId(userId)
      expect(result).toBeInstanceOf(UserIntro)
      expect(result!.userId).toBe(userId)
      expect(result!.completed).toBe(false)
    })
  })

  describe('create', () => {
    it('creates intro with completed=false', async () => {
      const intro = await repo.create(userId)
      expect(intro).toBeInstanceOf(UserIntro)
      expect(intro.completed).toBe(false)
      expect(intro.completedAt).toBeNull()
    })
  })

  describe('save', () => {
    it('saves completed state and updates user.name atomically', async () => {
      const intro = await repo.create(userId)
      intro.complete()

      await repo.save(intro, 'Alexandru')

      const updated = await repo.findByUserId(userId)
      expect(updated!.completed).toBe(true)
      expect(updated!.completedAt).not.toBeNull()

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
      expect(user!.name).toBe('Alexandru')
    })

    it('is idempotent — second save does not throw', async () => {
      const intro = await repo.create(userId)
      intro.complete()
      await repo.save(intro, 'Alexandru')
      await expect(repo.save(intro, 'Alexandru')).resolves.not.toThrow()
    })
  })
})
