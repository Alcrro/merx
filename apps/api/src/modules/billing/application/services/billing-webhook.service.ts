import { toPlanStatus } from '../../domain/plan-change'
import type { IBillingAccountRepository } from '../../domain/ports/billing-account.repository.port'
import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'
import type { IBillingWebhookVerifier } from '../../domain/ports/billing-webhook-verifier.port'
import type { PlanResolver } from './plan-resolver.service'

/** The webhook is the only writer of planStatus / planId. */
export class BillingWebhookService {
  constructor(
    private readonly verifier: IBillingWebhookVerifier,
    private readonly gateway: IBillingGateway,
    private readonly accounts: IBillingAccountRepository,
    private readonly plans: PlanResolver,
  ) {}

  async handle(payload: Buffer, signature: string): Promise<void> {
    const event = this.verifier.verify(payload, signature)
    if (!event) return

    // Current state from the provider, not the event payload — makes out-of-order delivery harmless.
    const snapshot = await this.gateway.getSubscriptionSnapshot(event.subscriptionId)
    const planStatus = toPlanStatus(snapshot.status)
    if (!planStatus) return

    const planId = this.plans.planFor(snapshot.priceId) ?? undefined
    await this.accounts.applyPlanState(
      { eventId: event.eventId, eventType: event.eventType },
      snapshot.customerId,
      { planStatus, planId },
    )
  }
}
