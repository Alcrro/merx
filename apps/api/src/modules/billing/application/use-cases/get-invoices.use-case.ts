import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'
import type { BillingInvoice } from '../../domain/types'

export class GetInvoicesUseCase {
  constructor(private readonly gateway: IBillingGateway) {}

  async execute(customerId: string): Promise<BillingInvoice[]> {
    return this.gateway.getInvoices(customerId)
  }
}
