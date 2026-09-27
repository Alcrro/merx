import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'
import type { BillingCard } from '../../domain/types'

export class GetPaymentMethodsUseCase {
  constructor(private readonly gateway: IBillingGateway) {}

  async execute(customerId: string): Promise<BillingCard[]> {
    return this.gateway.getPaymentMethods(customerId)
  }
}
