import { vi } from 'vitest'
import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'
import type { IBillingAccountRepository } from '../../domain/ports/billing-account.repository.port'
import type { IBillingWebhookVerifier } from '../../domain/ports/billing-webhook-verifier.port'
import type { ActiveSubscription, BillingAccount, SubscriptionSnapshot } from '../../domain/types'
import { PlanResolver, type PlanPriceMap } from '../../application/services/plan-resolver.service'

export const PRICES: PlanPriceMap = {
  starter: 'price_starter',
  pro: 'price_pro',
  scale: 'price_scale',
}

export function makePlanResolver(prices: PlanPriceMap = PRICES): PlanResolver {
  return new PlanResolver(prices)
}

export function makeAccount(overrides: Partial<BillingAccount> = {}): BillingAccount {
  return {
    userId: 'u1',
    email: 'merchant@example.com',
    name: 'Merchant',
    stripeCustomerId: 'cus_1',
    ...overrides,
  }
}

export function makeSubscription(overrides: Partial<ActiveSubscription> = {}): ActiveSubscription {
  return {
    subscriptionId: 'sub_1',
    itemId: 'si_1',
    planName: 'Pro',
    priceId: PRICES.pro,
    priceAmount: 4900,
    currency: 'eur',
    interval: 'month',
    startsAt: 1_700_000_000,
    renewsAt: 1_702_592_000,
    cancelAtPeriodEnd: false,
    ...overrides,
  }
}

export function makeSnapshot(overrides: Partial<SubscriptionSnapshot> = {}): SubscriptionSnapshot {
  return {
    subscriptionId: 'sub_1',
    customerId: 'cus_1',
    status: 'active',
    priceId: PRICES.pro,
    hasPendingSchedule: false,
    ...overrides,
  }
}

export function makeGateway(): IBillingGateway {
  return {
    createCustomer: vi.fn().mockResolvedValue('cus_new'),
    getActiveSubscription: vi.fn().mockResolvedValue(makeSubscription()),
    getSubscriptionSnapshot: vi.fn().mockResolvedValue(makeSnapshot()),
    cancelSubscription: vi.fn().mockResolvedValue(undefined),
    undoCancelSubscription: vi.fn().mockResolvedValue(undefined),
    upgradeSubscription: vi.fn().mockResolvedValue(undefined),
    scheduleDowngrade: vi.fn().mockResolvedValue(undefined),
    getPaymentMethods: vi.fn().mockResolvedValue([]),
    createPortalSession: vi.fn().mockResolvedValue('https://portal'),
    createCheckoutSession: vi.fn().mockResolvedValue('https://checkout'),
    getInvoices: vi.fn().mockResolvedValue([]),
  }
}

export function makeAccountRepo(): IBillingAccountRepository {
  return {
    findById: vi.fn().mockResolvedValue(makeAccount()),
    setStripeCustomerId: vi.fn().mockResolvedValue(undefined),
    applyPlanState: vi.fn().mockResolvedValue('applied'),
  }
}

export function makeVerifier(): IBillingWebhookVerifier {
  return {
    verify: vi.fn().mockReturnValue({
      eventId: 'evt_1',
      eventType: 'customer.subscription.updated',
      subscriptionId: 'sub_1',
    }),
  }
}
