import { BillingError } from '../../domain/errors'
import { resolvePlanChange, type PlanChange } from '../../domain/plan-change'
import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'
import type { PaidPlanId } from '../../domain/types'
import type { ActiveSubscriptionService } from '../services/active-subscription.service'
import type { PlanResolver } from '../services/plan-resolver.service'

/**
 * Plan switch per business-rules/billing/subscription-changes.md.
 * Only calls the provider — plan state in our DB is written by the webhook.
 */
export class UpgradeSubscriptionUseCase {
  constructor(
    private readonly subscriptions: ActiveSubscriptionService,
    private readonly gateway: IBillingGateway,
    private readonly plans: PlanResolver,
  ) {}

  async execute(userId: string, planId: PaidPlanId): Promise<PlanChange> {
    const subscription = await this.subscriptions.require(userId)

    const currentPlanId = this.plans.planFor(subscription.priceId)
    if (!currentPlanId) throw BillingError.invalidPlan('Current subscription is not on a self-serve plan')

    const change = resolvePlanChange(currentPlanId, planId)
    if (change === 'same') throw BillingError.conflict('Already on this plan')

    const newPriceId = this.plans.priceFor(planId)

    const snapshot = await this.gateway.getSubscriptionSnapshot(subscription.subscriptionId)
    if (snapshot.hasPendingSchedule) throw BillingError.conflict('A plan change is already scheduled')

    if (change === 'upgrade') {
      await this.gateway.upgradeSubscription(subscription.subscriptionId, subscription.itemId, newPriceId)
    } else {
      await this.gateway.scheduleDowngrade(subscription.subscriptionId, newPriceId)
    }
    return change
  }
}
