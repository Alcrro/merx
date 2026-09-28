import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpgradeSubscriptionUseCase } from '../../application/use-cases/upgrade-subscription.use-case'
import { ActiveSubscriptionService } from '../../application/services/active-subscription.service'
import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'
import type { IBillingAccountRepository } from '../../domain/ports/billing-account.repository.port'
import {
  makeAccountRepo,
  makeGateway,
  makePlanResolver,
  makeSnapshot,
  makeSubscription,
  PRICES,
} from '../fixtures/billing.fixtures'

describe('UpgradeSubscriptionUseCase', () => {
  let gateway: IBillingGateway
  let accounts: IBillingAccountRepository
  let useCase: UpgradeSubscriptionUseCase

  beforeEach(() => {
    gateway = makeGateway()
    accounts = makeAccountRepo()
    useCase = new UpgradeSubscriptionUseCase(
      new ActiveSubscriptionService(accounts, gateway),
      gateway,
      makePlanResolver(),
    )
    vi.mocked(gateway.getActiveSubscription).mockResolvedValue(
      makeSubscription({ subscriptionId: 'sub_1', itemId: 'si_1', priceId: PRICES.pro }),
    )
  })

  it('upgrades immediately when the new plan is more expensive', async () => {
    await expect(useCase.execute('u1', 'scale')).resolves.toBe('upgrade')
    expect(gateway.upgradeSubscription).toHaveBeenCalledWith('sub_1', 'si_1', PRICES.scale)
    expect(gateway.scheduleDowngrade).not.toHaveBeenCalled()
  })

  it('schedules a downgrade when the new plan is cheaper', async () => {
    await expect(useCase.execute('u1', 'starter')).resolves.toBe('downgrade')
    expect(gateway.scheduleDowngrade).toHaveBeenCalledWith('sub_1', PRICES.starter)
    expect(gateway.upgradeSubscription).not.toHaveBeenCalled()
  })

  it('derives the current plan from the subscription price, not from input', async () => {
    vi.mocked(gateway.getActiveSubscription).mockResolvedValue(makeSubscription({ priceId: PRICES.scale }))
    // pro < scale → must be a downgrade regardless of what the client believes
    await expect(useCase.execute('u1', 'pro')).resolves.toBe('downgrade')
    expect(gateway.scheduleDowngrade).toHaveBeenCalled()
  })

  it('throws CONFLICT when switching to the current plan', async () => {
    await expect(useCase.execute('u1', 'pro')).rejects.toMatchObject({ code: 'CONFLICT' })
    expect(gateway.upgradeSubscription).not.toHaveBeenCalled()
    expect(gateway.scheduleDowngrade).not.toHaveBeenCalled()
  })

  it.each(['starter', 'scale'] as const)('throws CONFLICT when a plan change is already scheduled (→ %s)', async (planId) => {
    vi.mocked(gateway.getSubscriptionSnapshot).mockResolvedValue(makeSnapshot({ hasPendingSchedule: true }))
    await expect(useCase.execute('u1', planId)).rejects.toMatchObject({ code: 'CONFLICT' })
    expect(gateway.upgradeSubscription).not.toHaveBeenCalled()
    expect(gateway.scheduleDowngrade).not.toHaveBeenCalled()
  })

  it('throws INVALID_PLAN when the current price is not a self-serve plan', async () => {
    vi.mocked(gateway.getActiveSubscription).mockResolvedValue(makeSubscription({ priceId: 'price_enterprise' }))
    await expect(useCase.execute('u1', 'scale')).rejects.toMatchObject({ code: 'INVALID_PLAN' })
  })

  it('throws INVALID_PLAN when the target plan has no configured price', async () => {
    useCase = new UpgradeSubscriptionUseCase(
      new ActiveSubscriptionService(accounts, gateway),
      gateway,
      makePlanResolver({ ...PRICES, scale: '' }),
    )
    await expect(useCase.execute('u1', 'scale')).rejects.toMatchObject({ code: 'INVALID_PLAN' })
    expect(gateway.upgradeSubscription).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND without an active subscription', async () => {
    vi.mocked(gateway.getActiveSubscription).mockResolvedValue(null)
    await expect(useCase.execute('u1', 'scale')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('never writes plan state to the account (webhook is the only writer)', async () => {
    await useCase.execute('u1', 'scale')
    await useCase.execute('u1', 'starter')
    expect(accounts.applyPlanState).not.toHaveBeenCalled()
    expect(accounts.setStripeCustomerId).not.toHaveBeenCalled()
  })
})
