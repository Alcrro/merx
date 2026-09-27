import { BillingError } from '../../domain/errors'
import type { IBillingAccountRepository } from '../../domain/ports/billing-account.repository.port'
import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'
import type { ActiveSubscription } from '../../domain/types'

/** Resolves the caller's own subscription server-side — subscription IDs are never taken from the client. */
export class ActiveSubscriptionService {
  constructor(
    private readonly accounts: IBillingAccountRepository,
    private readonly gateway: IBillingGateway,
  ) {}

  async require(userId: string): Promise<ActiveSubscription> {
    const account = await this.accounts.findById(userId)
    const subscription = account?.stripeCustomerId
      ? await this.gateway.getActiveSubscription(account.stripeCustomerId)
      : null
    if (!subscription) throw BillingError.notFound('No active subscription')
    return subscription
  }
}
