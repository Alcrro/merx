import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'

export class CreatePortalSessionUseCase {
  constructor(
    private readonly gateway: IBillingGateway,
    private readonly returnUrl: string,
  ) {}

  async execute(customerId: string): Promise<string> {
    return this.gateway.createPortalSession(customerId, this.returnUrl)
  }
}
