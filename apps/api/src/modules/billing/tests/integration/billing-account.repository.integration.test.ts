import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { BillingAccountRepository } from '../../infrastructure/db/repositories/billing-account.repository'
import { prisma } from '../../../../lib/prisma'

const TEST_EMAIL = 'billing-integration@test.example.com'
const TEST_CUSTOMER = 'cus_billing_integration_test'
const EVENT_PREFIX = 'evt_billing_integration_'

async function cleanup(): Promise<void> {
  await prisma.processedStripeEvent.deleteMany({ where: { eventId: { startsWith: `billing:${EVENT_PREFIX}` } } })
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } })
}

describe('BillingAccountRepository (integration)', () => {
  const repo = new BillingAccountRepository()
  let userId: string

  beforeEach(async () => {
    await cleanup()
    const user = await prisma.user.create({
      data: { email: TEST_EMAIL, name: 'Billing Test', stripeCustomerId: TEST_CUSTOMER },
      select: { id: true },
    })
    userId = user.id
  })

  afterEach(async () => {
    await cleanup()
  })

  it('findById returns only billing fields', async () => {
    const account = await repo.findById(userId)
    expect(account).toEqual({ userId, email: TEST_EMAIL, name: 'Billing Test', stripeCustomerId: TEST_CUSTOMER })
  })

  it('applies plan state and records the event under the billing namespace', async () => {
    const result = await repo.applyPlanState(
      { eventId: `${EVENT_PREFIX}1`, eventType: 'customer.subscription.updated' },
      TEST_CUSTOMER,
      { planStatus: 'past_due', planId: 'pro' },
    )

    expect(result).toBe('applied')
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { planStatus: true, planId: true } })
    expect(user).toEqual({ planStatus: 'past_due', planId: 'pro' })
    const events = await prisma.processedStripeEvent.findMany({ where: { eventId: `billing:${EVENT_PREFIX}1` } })
    expect(events).toHaveLength(1)
  })

  it('same event twice → second is a duplicate and writes nothing', async () => {
    const event = { eventId: `${EVENT_PREFIX}2`, eventType: 'customer.subscription.updated' }

    await expect(repo.applyPlanState(event, TEST_CUSTOMER, { planStatus: 'active', planId: 'pro' })).resolves.toBe('applied')
    await expect(repo.applyPlanState(event, TEST_CUSTOMER, { planStatus: 'cancelled', planId: 'scale' })).resolves.toBe('duplicate')

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { planStatus: true, planId: true } })
    expect(user).toEqual({ planStatus: 'active', planId: 'pro' })
    expect(await prisma.processedStripeEvent.count({ where: { eventId: `billing:${EVENT_PREFIX}2` } })).toBe(1)
  })

  it('leaves planId unchanged when the state has no planId', async () => {
    await repo.applyPlanState({ eventId: `${EVENT_PREFIX}3`, eventType: 'x' }, TEST_CUSTOMER, { planStatus: 'active', planId: 'scale' })
    await repo.applyPlanState({ eventId: `${EVENT_PREFIX}4`, eventType: 'x' }, TEST_CUSTOMER, { planStatus: 'cancelled' })

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { planStatus: true, planId: true } })
    expect(user).toEqual({ planStatus: 'cancelled', planId: 'scale' })
  })

  it('unknown customer → event recorded, no account touched', async () => {
    const result = await repo.applyPlanState(
      { eventId: `${EVENT_PREFIX}5`, eventType: 'x' },
      'cus_does_not_exist',
      { planStatus: 'expired' },
    )
    expect(result).toBe('applied')
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { planStatus: true } })
    expect(user.planStatus).toBe('trial')
  })

  it('setStripeCustomerId persists the customer', async () => {
    await repo.setStripeCustomerId(userId, `${TEST_CUSTOMER}_2`)
    expect((await repo.findById(userId))?.stripeCustomerId).toBe(`${TEST_CUSTOMER}_2`)
  })
})
