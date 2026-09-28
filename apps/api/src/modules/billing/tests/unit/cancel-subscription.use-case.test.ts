import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CancelSubscriptionUseCase } from '../../application/use-cases/cancel-subscription.use-case'
import { UndoCancelSubscriptionUseCase } from '../../application/use-cases/undo-cancel-subscription.use-case'
import { ActiveSubscriptionService } from '../../application/services/active-subscription.service'
import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'
import type { IBillingAccountRepository } from '../../domain/ports/billing-account.repository.port'
import { makeAccount, makeAccountRepo, makeGateway, makeSubscription } from '../fixtures/billing.fixtures'

describe('Cancel / UndoCancel subscription', () => {
  let gateway: IBillingGateway
  let accounts: IBillingAccountRepository
  let cancel: CancelSubscriptionUseCase
  let undo: UndoCancelSubscriptionUseCase

  beforeEach(() => {
    gateway = makeGateway()
    accounts = makeAccountRepo()
    const subscriptions = new ActiveSubscriptionService(accounts, gateway)
    cancel = new CancelSubscriptionUseCase(subscriptions, gateway)
    undo = new UndoCancelSubscriptionUseCase(subscriptions, gateway)
  })

  it('cancels the subscription resolved from the caller account', async () => {
    vi.mocked(accounts.findById).mockResolvedValue(makeAccount({ userId: 'u1', stripeCustomerId: 'cus_A' }))
    vi.mocked(gateway.getActiveSubscription).mockResolvedValue(makeSubscription({ subscriptionId: 'sub_A' }))

    await cancel.execute('u1')

    expect(accounts.findById).toHaveBeenCalledWith('u1')
    expect(gateway.getActiveSubscription).toHaveBeenCalledWith('cus_A')
    expect(gateway.cancelSubscription).toHaveBeenCalledWith('sub_A')
  })

  it('undo acts on the caller subscription', async () => {
    vi.mocked(gateway.getActiveSubscription).mockResolvedValue(makeSubscription({ subscriptionId: 'sub_A' }))
    await undo.execute('u1')
    expect(gateway.undoCancelSubscription).toHaveBeenCalledWith('sub_A')
  })

  it('throws NOT_FOUND when the account has no Stripe customer (no Stripe call)', async () => {
    vi.mocked(accounts.findById).mockResolvedValue(makeAccount({ stripeCustomerId: null }))
    await expect(cancel.execute('u1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    expect(gateway.getActiveSubscription).not.toHaveBeenCalled()
    expect(gateway.cancelSubscription).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when the account does not exist', async () => {
    vi.mocked(accounts.findById).mockResolvedValue(null)
    await expect(undo.execute('u1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    expect(gateway.undoCancelSubscription).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when there is no active subscription', async () => {
    vi.mocked(gateway.getActiveSubscription).mockResolvedValue(null)
    await expect(cancel.execute('u1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    expect(gateway.cancelSubscription).not.toHaveBeenCalled()
  })
})
