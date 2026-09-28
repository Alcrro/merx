import { Router } from 'express'
import { billingWebhookService } from './container'
import { createBillingWebhookController } from './presentation/controllers/billing-webhook.controller'

const router = Router()
const controller = createBillingWebhookController({ billingWebhookService })

// Mounted with express.raw() — signature verification needs the unparsed body.
router.post('/', controller.handle)

export { router as billingWebhookRouter }
