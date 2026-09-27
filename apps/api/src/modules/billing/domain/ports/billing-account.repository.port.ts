import type { ApplyPlanStateResult, BillingAccount, PlanState } from '../types'

/** Billing-related fields on the merchant account (our DB). */
export interface IBillingAccountRepository {
  findById(userId: string): Promise<BillingAccount | null>
  setStripeCustomerId(userId: string, customerId: string): Promise<void>

  /**
   * Records the provider event and applies the plan state to the account owning `customerId`, atomically.
   * Returns 'duplicate' (and writes nothing) when the event was already processed.
   */
  applyPlanState(
    event: { eventId: string; eventType: string },
    customerId: string,
    state: PlanState,
  ): Promise<ApplyPlanStateResult>
}
