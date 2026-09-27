import type { PlanId } from '@merx/types'

export interface BillingCard {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

export interface BillingInvoice {
  id: string
  number: string | null
  date: number
  amount: number
  currency: string
  status: 'paid' | 'open' | 'void' | 'uncollectible'
  pdfUrl: string | null
}

export interface ActiveSubscription {
  subscriptionId: string
  itemId: string
  planName: string
  priceId: string
  priceAmount: number
  currency: string
  interval: string
  startsAt: number
  renewsAt: number
  cancelAtPeriodEnd: boolean
}

export interface CheckoutSessionParams {
  customerId: string
  priceId: string
  userId: string
  planId: string
  successUrl: string
  cancelUrl: string
}

export type PaidPlanId = Exclude<PlanId, 'enterprise'>

export type PlanStatusValue = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'

/** Current provider-side state of one subscription, re-fetched on demand (never taken from an event payload). */
export interface SubscriptionSnapshot {
  subscriptionId: string
  customerId: string
  status: SubscriptionStatus
  priceId: string
  hasPendingSchedule: boolean
}

/** Normalized billing webhook event — carries only identifiers; state is re-fetched from the provider. */
export interface BillingWebhookEvent {
  eventId: string
  eventType: string
  subscriptionId: string
}

export interface BillingAccount {
  userId: string
  email: string
  name: string | null
  stripeCustomerId: string | null
}

/** Plan state written on the account. `planId` undefined → left unchanged. */
export interface PlanState {
  planStatus: PlanStatusValue
  planId?: PaidPlanId
}

export type ApplyPlanStateResult = 'applied' | 'duplicate'
