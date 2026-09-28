import { Router } from 'express'
import { authenticate, withAuth } from '../../middleware/authenticate'
import {
  getOrCreateCustomerUseCase,
  getSubscriptionUseCase,
  cancelSubscriptionUseCase,
  undoCancelSubscriptionUseCase,
  upgradeSubscriptionUseCase,
  getPaymentMethodsUseCase,
  createPortalSessionUseCase,
  createCheckoutSessionUseCase,
  getInvoicesUseCase,
} from './container'
import { createBillingController } from './presentation/controllers/billing.controller'

const router = Router()
const controller = createBillingController({
  getOrCreateCustomerUseCase,
  getSubscriptionUseCase,
  cancelSubscriptionUseCase,
  undoCancelSubscriptionUseCase,
  upgradeSubscriptionUseCase,
  getPaymentMethodsUseCase,
  createPortalSessionUseCase,
  createCheckoutSessionUseCase,
  getInvoicesUseCase,
})

router.post('/customer', authenticate, withAuth(controller.getOrCreateCustomer))
router.get('/subscription', authenticate, withAuth(controller.getSubscription))
router.post('/subscription/cancel', authenticate, withAuth(controller.cancelSubscription))
router.post('/subscription/undo', authenticate, withAuth(controller.undoCancelSubscription))
router.post('/subscription/upgrade', authenticate, withAuth(controller.upgradeSubscription))
router.get('/payment-methods', authenticate, withAuth(controller.getPaymentMethods))
router.post('/portal', authenticate, withAuth(controller.createPortalSession))
router.post('/checkout', authenticate, withAuth(controller.createCheckoutSession))
router.get('/invoices', authenticate, withAuth(controller.getInvoices))

export { router as billingRouter }
