import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BillingWebhookService } from '../../application/services/billing-webhook.service'
import { BillingError } from '../../domain/errors'
import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'
import type { IBillingAccountRepository } from '../../domain/ports/billing-account.repository.port'
import type { IBillingWebhookVerifier } from '../../domain/ports/billing-webhook-verifier.port'
import {
  makeAccountRepo,
  makeGateway,
  makePlanResolver,
  makeSnapshot,
  makeVerifier,
  PRICES,
} from '../fixtures/billing.fixtures'

const PAYLOAD = Buffer.from('{}')

describe('BillingWebhookService', () => {
  let verifier: IBillingWebhookVerifier
  let gateway: IBillingGateway
  let accounts: IBillingAccountRepository
  let service: BillingWebhookService

  beforeEach(() => {
    verifier = makeVerifier()
    gateway = makeGateway()
    accounts = makeAccountRepo()
    service = new BillingWebhookService(verifier, gateway, accounts, makePlanResolver())
  })

  it('applies state re-fetched from the provider (not the event payload)', async () => {
    vi.mocked(gateway.getSubscriptionSnapshot).mockResolvedValue(
      makeSnapshot({ customerId: 'cus_A', status: 'past_due', priceId: PRICES.scale }),
    )

    await service.handle(PAYLOAD, 'sig')

    expect(verifier.verify).toHaveBeenCalledWith(PAYLOAD, 'sig')
    expect(gateway.getSubscriptionSnapshot).toHaveBeenCalledWith('sub_1')
    expect(accounts.applyPlanState).toHaveBeenCalledWith(
      { eventId: 'evt_1', eventType: 'customer.subscription.updated' },
      'cus_A',
      { planStatus: 'past_due', planId: 'scale' },
    )
  })

  it('maps canceled → cancelled', async () => {
    vi.mocked(gateway.getSubscriptionSnapshot).mockResolvedValue(makeSnapshot({ status: 'canceled' }))
    await service.handle(PAYLOAD, 'sig')
    expect(accounts.applyPlanState).toHaveBeenCalledWith(expect.anything(), 'cus_1', {
      planStatus: 'cancelled',
      planId: 'pro',
    })
  })

  it('leaves planId untouched when the price is not a self-serve plan', async () => {
    vi.mocked(gateway.getSubscriptionSnapshot).mockResolvedValue(makeSnapshot({ priceId: 'price_legacy' }))
    await service.handle(PAYLOAD, 'sig')
    expect(accounts.applyPlanState).toHaveBeenCalledWith(expect.anything(), 'cus_1', {
      planStatus: 'active',
      planId: undefined,
    })
  })

  it('does nothing for incomplete subscriptions (initial payment pending)', async () => {
    vi.mocked(gateway.getSubscriptionSnapshot).mockResolvedValue(makeSnapshot({ status: 'incomplete' }))
    await service.handle(PAYLOAD, 'sig')
    expect(accounts.applyPlanState).not.toHaveBeenCalled()
  })

  it('ignores event types billing does not handle', async () => {
    vi.mocked(verifier.verify).mockReturnValue(null)
    await service.handle(PAYLOAD, 'sig')
    expect(gateway.getSubscriptionSnapshot).not.toHaveBeenCalled()
    expect(accounts.applyPlanState).not.toHaveBeenCalled()
  })

  it('is a no-op on duplicate delivery (repository reports duplicate)', async () => {
    vi.mocked(accounts.applyPlanState).mockResolvedValue('duplicate')
    await expect(service.handle(PAYLOAD, 'sig')).resolves.toBeUndefined()
  })

  it('propagates INVALID_WEBHOOK from the verifier without touching Stripe or the DB', async () => {
    vi.mocked(verifier.verify).mockImplementation(() => {
      throw BillingError.invalidWebhook()
    })
    await expect(service.handle(PAYLOAD, 'bad')).rejects.toMatchObject({ code: 'INVALID_WEBHOOK' })
    expect(gateway.getSubscriptionSnapshot).not.toHaveBeenCalled()
    expect(accounts.applyPlanState).not.toHaveBeenCalled()
  })

  it('propagates provider failures so Stripe retries', async () => {
    vi.mocked(gateway.getSubscriptionSnapshot).mockRejectedValue(new Error('Stripe down'))
    await expect(service.handle(PAYLOAD, 'sig')).rejects.toThrow('Stripe down')
    expect(accounts.applyPlanState).not.toHaveBeenCalled()
  })
})
