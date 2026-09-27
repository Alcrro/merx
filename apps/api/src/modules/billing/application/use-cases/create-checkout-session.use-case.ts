import type { IBillingGateway } from '../../domain/ports/billing-gateway.port'
import type { PaidPlanId } from '../../domain/types'
import type { PlanResolver } from '../services/plan-resolver.service'

export interface CheckoutUrls {
  successUrl: string
  cancelUrl: string
}

export class CreateCheckoutSessionUseCase {
  constructor(
    private readonly gateway: IBillingGateway,
    private readonly plans: PlanResolver,
    private readonly urls: CheckoutUrls,
  ) {}

  async execute(customerId: string, planId: PaidPlanId, userId: string): Promise<string> {
    return this.gateway.createCheckoutSession({
      customerId,
      priceId: this.plans.priceFor(planId),
      userId,
      planId,
      successUrl: this.urls.successUrl,
      cancelUrl: this.urls.cancelUrl,
    })
  }
}
