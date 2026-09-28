import { config } from '../../config'
import { StripeBillingGateway } from './infrastructure/stripe/stripe.billing-gateway'
import { StripeWebhookVerifier } from './infrastructure/stripe/stripe-webhook.verifier'
import { BillingAccountRepository } from './infrastructure/db/repositories/billing-account.repository'
import { PlanResolver } from './application/services/plan-resolver.service'
import { ActiveSubscriptionService } from './application/services/active-subscription.service'
import { BillingWebhookService } from './application/services/billing-webhook.service'
import { GetOrCreateCustomerUseCase } from './application/use-cases/get-or-create-customer.use-case'
import { GetSubscriptionUseCase } from './application/use-cases/get-subscription.use-case'
import { CancelSubscriptionUseCase } from './application/use-cases/cancel-subscription.use-case'
import { UndoCancelSubscriptionUseCase } from './application/use-cases/undo-cancel-subscription.use-case'
import { UpgradeSubscriptionUseCase } from './application/use-cases/upgrade-subscription.use-case'
import { GetPaymentMethodsUseCase } from './application/use-cases/get-payment-methods.use-case'
import { CreatePortalSessionUseCase } from './application/use-cases/create-portal-session.use-case'
import { CreateCheckoutSessionUseCase } from './application/use-cases/create-checkout-session.use-case'
import { GetInvoicesUseCase } from './application/use-cases/get-invoices.use-case'

const gateway = new StripeBillingGateway()
const accountRepository = new BillingAccountRepository()
const planResolver = new PlanResolver(config.stripe.prices)
const activeSubscriptionService = new ActiveSubscriptionService(accountRepository, gateway)

export const getOrCreateCustomerUseCase = new GetOrCreateCustomerUseCase(accountRepository, gateway)
export const getSubscriptionUseCase = new GetSubscriptionUseCase(gateway)
export const cancelSubscriptionUseCase = new CancelSubscriptionUseCase(activeSubscriptionService, gateway)
export const undoCancelSubscriptionUseCase = new UndoCancelSubscriptionUseCase(activeSubscriptionService, gateway)
export const upgradeSubscriptionUseCase = new UpgradeSubscriptionUseCase(activeSubscriptionService, gateway, planResolver)
export const getPaymentMethodsUseCase = new GetPaymentMethodsUseCase(gateway)
export const createPortalSessionUseCase = new CreatePortalSessionUseCase(
  gateway,
  `${config.server.wwwUrl}/account/billing`,
)
export const createCheckoutSessionUseCase = new CreateCheckoutSessionUseCase(gateway, planResolver, {
  successUrl: `${config.server.wwwUrl}/account/subscription?success=1`,
  cancelUrl: `${config.server.wwwUrl}/account/subscription`,
})
export const getInvoicesUseCase = new GetInvoicesUseCase(gateway)
export const billingWebhookService = new BillingWebhookService(
  new StripeWebhookVerifier(config.stripe.billingWebhookSecret),
  gateway,
  accountRepository,
  planResolver,
)
