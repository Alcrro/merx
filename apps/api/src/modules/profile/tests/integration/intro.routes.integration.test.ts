import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import app from '../../../../app/server'
import { prisma } from '../../../../lib/prisma'
import { jwtTokenService } from '../../../auth/infrastructure/adapters/jwt.token-service'

const TEST_EMAIL = 'profile-routes@test.example.com'

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

function makeToken(userId: string): string {
  return jwtTokenService.signPlatformToken({ sub: userId, type: 'platform' })
}

describe('Profile routes (integration)', () => {
  let userId: string
  let token: string

  beforeEach(async () => {
    await cleanup()
    userId = await createTestUser()
    token = makeToken(userId)
  })

  afterEach(async () => {
    await cleanup()
  })

  describe('GET /api/v1/users/intro', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/v1/users/intro')
      expect(res.status).toBe(401)
    })

    it('returns completed=false when no intro record exists', async () => {
      const res = await request(app)
        .get('/api/v1/users/intro')
        .set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ completed: false })
    })

    it('returns completed=false when intro exists but not completed', async () => {
      await prisma.userIntro.create({ data: { userId } })
      const res = await request(app)
        .get('/api/v1/users/intro')
        .set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ completed: false })
    })

    it('returns completed=true when intro is completed', async () => {
      await prisma.userIntro.create({ data: { userId, completed: true, completedAt: new Date() } })
      const res = await request(app)
        .get('/api/v1/users/intro')
        .set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ completed: true })
    })
  })

  describe('POST /api/v1/users/intro/complete', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/v1/users/intro/complete').send({ name: 'Alex' })
      expect(res.status).toBe(401)
    })

    it('auto-creates record and completes when no intro record exists', async () => {
      const res = await request(app)
        .post('/api/v1/users/intro/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Alexandru' })
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ completed: true, userName: 'Alexandru' })
    })

    it('returns 400 when name is too short', async () => {
      await prisma.userIntro.create({ data: { userId } })
      const res = await request(app)
        .post('/api/v1/users/intro/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'A' })
      expect(res.status).toBe(400)
    })

    it('completes intro and saves user.name', async () => {
      await prisma.userIntro.create({ data: { userId } })
      const res = await request(app)
        .post('/api/v1/users/intro/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Alexandru' })
      expect(res.status).toBe(200)
      expect(res.body).toEqual({ completed: true, userName: 'Alexandru' })

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } })
      expect(user!.name).toBe('Alexandru')
    })

    it('is idempotent — second call returns 200', async () => {
      await prisma.userIntro.create({ data: { userId, completed: true, completedAt: new Date() } })
      const res = await request(app)
        .post('/api/v1/users/intro/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Alexandru' })
      expect(res.status).toBe(200)
    })
  })
})
