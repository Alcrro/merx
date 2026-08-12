import { Router } from 'express'
import { storefrontController } from './storefront.controller'

export const storefrontRouter = Router()

storefrontRouter.get('/:storeSlug', storefrontController.getStore)
storefrontRouter.get('/:storeSlug/products', storefrontController.listProducts)
storefrontRouter.get('/:storeSlug/products/:productId', storefrontController.getProduct)
storefrontRouter.get('/:storeSlug/categories', storefrontController.listCategories)
storefrontRouter.post('/:storeSlug/checkout', storefrontController.checkout)
storefrontRouter.get('/:storeSlug/order-confirmation', storefrontController.orderConfirmation)

export const webhookRouter = Router()

// Raw body needed for Stripe signature verification — registered before express.json()
webhookRouter.post('/stripe', storefrontController.stripeWebhook)
