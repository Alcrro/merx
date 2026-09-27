import { PLAN_CONFIG } from '@merx/types'
import type { PaidPlanId, PlanStatusValue, SubscriptionStatus } from './types'

export const PAID_PLAN_IDS = ['starter', 'pro', 'scale'] as const satisfies readonly PaidPlanId[]

export type PlanChange = 'upgrade' | 'downgrade' | 'same'

export function isPaidPlanId(value: string): value is PaidPlanId {
  return (PAID_PLAN_IDS as readonly string[]).includes(value)
}

/** Direction is decided by price (business-rules/billing/subscription-changes.md). */
export function resolvePlanChange(current: PaidPlanId, next: PaidPlanId): PlanChange {
  const diff = PLAN_CONFIG[next].price - PLAN_CONFIG[current].price
  if (diff > 0) return 'upgrade'
  if (diff < 0) return 'downgrade'
  return 'same'
}

/**
 * Maps provider subscription status to the account plan status.
 * null → transitional state that must not change the account (initial payment still pending).
 */
export function toPlanStatus(status: SubscriptionStatus): PlanStatusValue | null {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active'
    case 'past_due':
      return 'past_due'
    case 'unpaid':
    case 'incomplete_expired':
    case 'paused':
      return 'expired'
    case 'canceled':
      return 'cancelled'
    case 'incomplete':
      return null
  }
}
