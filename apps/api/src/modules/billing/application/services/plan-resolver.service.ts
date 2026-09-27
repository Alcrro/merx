import { BillingError } from '../../domain/errors'
import { PAID_PLAN_IDS } from '../../domain/plan-change'
import type { PaidPlanId } from '../../domain/types'

/** planId → provider price ID. An empty string means the plan is not configured in this environment. */
export type PlanPriceMap = Readonly<Record<PaidPlanId, string>>

export class PlanResolver {
  constructor(private readonly prices: PlanPriceMap) {}

  priceFor(planId: PaidPlanId): string {
    const priceId = this.prices[planId]
    if (!priceId) throw BillingError.invalidPlan(`Plan not available: ${planId}`)
    return priceId
  }

  /** null → the price does not belong to a self-serve plan (e.g. enterprise or a legacy price). */
  planFor(priceId: string): PaidPlanId | null {
    if (!priceId) return null
    return PAID_PLAN_IDS.find((planId) => this.prices[planId] === priceId) ?? null
  }
}
