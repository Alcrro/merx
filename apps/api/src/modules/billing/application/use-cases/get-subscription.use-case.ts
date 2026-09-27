import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'
import type { ActiveSubscription } from '../../domain/types'

export class GetSubscriptionUseCase {
  constructor(private readonly gateway: IBillingGateway) {}

  async execute(customerId: string): Promise<ActiveSubscription | null> {
    return this.gateway.getActiveSubscription(customerId)
  }
}
