import { describe, it, expect, beforeEach } from 'vitest'
import { CreateCheckoutSessionUseCase } from '../../application/use-cases/create-checkout-session.use-case'
import { CreatePortalSessionUseCase } from '../../application/use-cases/create-portal-session.use-case'
import { GetSubscriptionUseCase } from '../../application/use-cases/get-subscription.use-case'
import { GetPaymentMethodsUseCase } from '../../application/use-cases/get-payment-methods.use-case'
import { GetInvoicesUseCase } from '../../application/use-cases/get-invoices.use-case'
import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'
import { makeGateway, makePlanResolver, PRICES } from '../fixtures/billing.fixtures'

const URLS = { successUrl: 'https://www/ok', cancelUrl: 'https://www/cancel' }

describe('CreateCheckoutSessionUseCase', () => {
  let gateway: IBillingGateway

  beforeEach(() => {
    gateway = makeGateway()
  })

  it('resolves the price server-side and passes metadata + URLs', async () => {
    const useCase = new CreateCheckoutSessionUseCase(gateway, makePlanResolver(), URLS)
    await expect(useCase.execute('cus_1', 'scale', 'u1')).resolves.toBe('https://checkout')
    expect(gateway.createCheckoutSession).toHaveBeenCalledWith({
      customerId: 'cus_1',
      priceId: PRICES.scale,
      userId: 'u1',
      planId: 'scale',
      ...URLS,
    })
  })

  it('throws INVALID_PLAN when the plan has no configured price', async () => {
    const useCase = new CreateCheckoutSessionUseCase(gateway, makePlanResolver({ ...PRICES, pro: '' }), URLS)
    await expect(useCase.execute('cus_1', 'pro', 'u1')).rejects.toMatchObject({ code: 'INVALID_PLAN' })
    expect(gateway.createCheckoutSession).not.toHaveBeenCalled()
  })
})

describe('read / portal use cases', () => {
  it('portal uses the injected return URL', async () => {
    const gateway = makeGateway()
    await new CreatePortalSessionUseCase(gateway, 'https://www/account/billing').execute('cus_1')
    expect(gateway.createPortalSession).toHaveBeenCalledWith('cus_1', 'https://www/account/billing')
  })

  it('read use cases are scoped to the given customer', async () => {
    const gateway = makeGateway()
    await new GetSubscriptionUseCase(gateway).execute('cus_1')
    await new GetPaymentMethodsUseCase(gateway).execute('cus_1')
    await new GetInvoicesUseCase(gateway).execute('cus_1')
    expect(gateway.getActiveSubscription).toHaveBeenCalledWith('cus_1')
    expect(gateway.getPaymentMethods).toHaveBeenCalledWith('cus_1')
    expect(gateway.getInvoices).toHaveBeenCalledWith('cus_1')
  })
})
