import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'
import type { ActiveSubscriptionService } from '../services/active-subscription.service'

export class UndoCancelSubscriptionUseCase {
  constructor(
    private readonly subscriptions: ActiveSubscriptionService,
    private readonly gateway: IBillingGateway,
  ) {}

  async execute(userId: string): Promise<void> {
    const subscription = await this.subscriptions.require(userId)
    await this.gateway.undoCancelSubscription(subscription.subscriptionId)
  }
}
