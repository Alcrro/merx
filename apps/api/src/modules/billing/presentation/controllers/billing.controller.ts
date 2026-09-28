import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../../../middleware/authenticate'
import type { GetOrCreateCustomerUseCase } from '../../application/use-cases/get-or-create-customer.use-case'
import type { GetSubscriptionUseCase } from '../../application/use-cases/get-subscription.use-case'
import type { CancelSubscriptionUseCase } from '../../application/use-cases/cancel-subscription.use-case'
import type { UndoCancelSubscriptionUseCase } from '../../application/use-cases/undo-cancel-subscription.use-case'
import type { UpgradeSubscriptionUseCase } from '../../application/use-cases/upgrade-subscription.use-case'
import type { GetPaymentMethodsUseCase } from '../../application/use-cases/get-payment-methods.use-case'
import type { CreatePortalSessionUseCase } from '../../application/use-cases/create-portal-session.use-case'
import type { CreateCheckoutSessionUseCase } from '../../application/use-cases/create-checkout-session.use-case'
import type { GetInvoicesUseCase } from '../../application/use-cases/get-invoices.use-case'
import { BillingError } from '../../domain/errors'
import { billingValidator } from '../validators/billing.validator'
import { handleBillingError } from '../errors/billing.errors'
import type {
  CheckoutResponseDto,
  CustomerResponseDto,
  InvoicesResponseDto,
  PaymentMethodsResponseDto,
  PortalResponseDto,
  SubscriptionResponseDto,
} from '../dto/billing.dto'

export interface BillingControllerDeps {
  getOrCreateCustomerUseCase: GetOrCreateCustomerUseCase
  getSubscriptionUseCase: GetSubscriptionUseCase
  cancelSubscriptionUseCase: CancelSubscriptionUseCase
  undoCancelSubscriptionUseCase: UndoCancelSubscriptionUseCase
  upgradeSubscriptionUseCase: UpgradeSubscriptionUseCase
  getPaymentMethodsUseCase: GetPaymentMethodsUseCase
  createPortalSessionUseCase: CreatePortalSessionUseCase
  createCheckoutSessionUseCase: CreateCheckoutSessionUseCase
  getInvoicesUseCase: GetInvoicesUseCase
}

export function createBillingController({
  getOrCreateCustomerUseCase,
  getSubscriptionUseCase,
  cancelSubscriptionUseCase,
  undoCancelSubscriptionUseCase,
  upgradeSubscriptionUseCase,
  getPaymentMethodsUseCase,
  createPortalSessionUseCase,
  createCheckoutSessionUseCase,
  getInvoicesUseCase,
}: BillingControllerDeps) {
  const getCustomerId = (userId: string) => getOrCreateCustomerUseCase.execute(userId)

  const fail = (err: unknown, res: Response, next: NextFunction) => {
    if (err instanceof BillingError) handleBillingError(err, res); else next(err)
  }

  return {
    getOrCreateCustomer: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const customerId = await getCustomerId(req.user.userId)
        res.json({ customerId } satisfies CustomerResponseDto)
      } catch (err) {
        fail(err, res, next)
      }
    },

    getSubscription: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const customerId = await getCustomerId(req.user.userId)
        const subscription = await getSubscriptionUseCase.execute(customerId)
        res.json({ subscription } satisfies SubscriptionResponseDto)
      } catch (err) {
        fail(err, res, next)
      }
    },

    cancelSubscription: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        await cancelSubscriptionUseCase.execute(req.user.userId)
        res.sendStatus(204)
      } catch (err) {
        fail(err, res, next)
      }
    },

    undoCancelSubscription: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        await undoCancelSubscriptionUseCase.execute(req.user.userId)
        res.sendStatus(204)
      } catch (err) {
        fail(err, res, next)
      }
    },

    upgradeSubscription: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const { planId } = billingValidator.plan.parse(req.body)
        await upgradeSubscriptionUseCase.execute(req.user.userId, planId)
        res.sendStatus(204)
      } catch (err) {
        fail(err, res, next)
      }
    },

    getPaymentMethods: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const customerId = await getCustomerId(req.user.userId)
        const paymentMethods = await getPaymentMethodsUseCase.execute(customerId)
        res.json({ paymentMethods } satisfies PaymentMethodsResponseDto)
      } catch (err) {
        fail(err, res, next)
      }
    },

    createPortalSession: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const customerId = await getCustomerId(req.user.userId)
        const url = await createPortalSessionUseCase.execute(customerId)
        res.json({ url } satisfies PortalResponseDto)
      } catch (err) {
        fail(err, res, next)
      }
    },

    createCheckoutSession: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const { planId } = billingValidator.plan.parse(req.body)
        const customerId = await getCustomerId(req.user.userId)
        const url = await createCheckoutSessionUseCase.execute(customerId, planId, req.user.userId)
        res.json({ url } satisfies CheckoutResponseDto)
      } catch (err) {
        fail(err, res, next)
      }
    },

    getInvoices: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const customerId = await getCustomerId(req.user.userId)
        const invoices = await getInvoicesUseCase.execute(customerId)
        res.json({ invoices } satisfies InvoicesResponseDto)
      } catch (err) {
        fail(err, res, next)
      }
    },
  }
}
