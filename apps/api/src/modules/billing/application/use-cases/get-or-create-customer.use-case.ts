import { BillingError } from '../../domain/errors'
import type { IBillingAccountRepository } from '../../domain/ports/billing-account.repository.port'
import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'

export class GetOrCreateCustomerUseCase {
  constructor(
    private readonly accounts: IBillingAccountRepository,
    private readonly gateway: IBillingGateway,
  ) {}

  async execute(userId: string): Promise<string> {
    const account = await this.accounts.findById(userId)
    if (!account) throw BillingError.notFound('Account not found')
    if (account.stripeCustomerId) return account.stripeCustomerId

    const customerId = await this.gateway.createCustomer({
      userId,
      email: account.email,
      name: account.name,
    })
    await this.accounts.setStripeCustomerId(userId, customerId)
    return customerId
  }
}
