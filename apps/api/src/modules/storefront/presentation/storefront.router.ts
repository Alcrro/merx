import { Router } from 'express'
import { storefrontController } from './storefront.controller'
import { discountValidateRouter } from '../../discounts/presentation/discount.router'

export const storefrontRouter = Router()

storefrontRouter.get('/:storeSlug/meta', storefrontController.getStoreMeta)
storefrontRouter.get('/:storeSlug/theme', storefrontController.getPublishedTheme)
storefrontRouter.get('/:storeSlug', storefrontController.getStore)
storefrontRouter.get('/:storeSlug/products', storefrontController.listProducts)
storefrontRouter.get('/:storeSlug/products/:productId', storefrontController.getProduct)
storefrontRouter.get('/:storeSlug/categories', storefrontController.listCategories)
storefrontRouter.post('/:storeSlug/checkout', storefrontController.checkout)
storefrontRouter.get('/:storeSlug/order-confirmation', storefrontController.orderConfirmation)
storefrontRouter.use('/:storeSlug/discounts/validate', discountValidateRouter)

export const webhookRouter = Router()

// Raw body needed for Stripe signature verification — registered before express.json()
webhookRouter.post('/stripe', storefrontController.stripeWebhook)
