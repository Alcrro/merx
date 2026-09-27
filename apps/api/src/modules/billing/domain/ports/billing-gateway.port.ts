import type {
  ActiveSubscription,
  BillingCard,
  BillingInvoice,
  CheckoutSessionParams,
  SubscriptionSnapshot,
} from '../types'

/** Payment provider operations (Stripe). No persistence of our own. */
export interface IBillingGateway {
  createCustomer(input: { userId: string; email: string; name: string | null }): Promise<string>

  getActiveSubscription(customerId: string): Promise<ActiveSubscription | null>
  getSubscriptionSnapshot(subscriptionId: string): Promise<SubscriptionSnapshot>
  cancelSubscription(subscriptionId: string): Promise<void>
  undoCancelSubscription(subscriptionId: string): Promise<void>
  upgradeSubscription(subscriptionId: string, itemId: string, newPriceId: string): Promise<void>
  scheduleDowngrade(subscriptionId: string, newPriceId: string): Promise<void>

  getPaymentMethods(customerId: string): Promise<BillingCard[]>
  createPortalSession(customerId: string, returnUrl: string): Promise<string>
  createCheckoutSession(params: CheckoutSessionParams): Promise<string>

  getInvoices(customerId: string): Promise<BillingInvoice[]>
}
