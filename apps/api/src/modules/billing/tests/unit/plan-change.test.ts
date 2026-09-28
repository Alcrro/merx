import { describe, it, expect } from 'vitest'
import { isPaidPlanId, resolvePlanChange, toPlanStatus } from '../../domain/plan-change'
import type { PlanStatusValue, SubscriptionStatus } from '../../domain/types'

describe('resolvePlanChange', () => {
  it.each([
    ['starter', 'pro', 'upgrade'],
    ['starter', 'scale', 'upgrade'],
    ['pro', 'scale', 'upgrade'],
    ['scale', 'pro', 'downgrade'],
    ['pro', 'starter', 'downgrade'],
    ['scale', 'starter', 'downgrade'],
    ['pro', 'pro', 'same'],
  ] as const)('%s → %s = %s', (current, next, expected) => {
    expect(resolvePlanChange(current, next)).toBe(expected)
  })
})

describe('isPaidPlanId', () => {
  it('accepts self-serve plans only', () => {
    expect(isPaidPlanId('starter')).toBe(true)
    expect(isPaidPlanId('scale')).toBe(true)
    expect(isPaidPlanId('enterprise')).toBe(false)
    expect(isPaidPlanId('')).toBe(false)
  })
})

describe('toPlanStatus', () => {
  it.each<[SubscriptionStatus, PlanStatusValue | null]>([
    ['active', 'active'],
    ['trialing', 'active'],
    ['past_due', 'past_due'],
    ['unpaid', 'expired'],
    ['incomplete_expired', 'expired'],
    ['paused', 'expired'],
    ['canceled', 'cancelled'],
    ['incomplete', null],
  ])('%s → %s', (status, expected) => {
    expect(toPlanStatus(status)).toBe(expected)
  })
})
