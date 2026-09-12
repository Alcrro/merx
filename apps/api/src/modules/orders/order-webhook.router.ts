import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { stripe } from '../../lib/stripe'
import { config } from '../../config'
import { orderWebhookService } from './container'

const router = Router()

const webhookLimiter = rateLimit({ windowMs: 60_000, max: 100 })

router.post('/stripe', webhookLimiter, async (req, res) => {
  const sig = req.headers['stripe-signature']

  if (!sig || !config.stripe.ordersWebhookSecret) {
    res.status(400).json({ error: 'Bad request' })
    return
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, config.stripe.ordersWebhookSecret)
  } catch {
    res.status(400).json({ error: 'Bad request' })
    return
  }

  try {
    await orderWebhookService.handleStripeEvent(event)
  } catch (err) {
    console.error('[order-webhook] handleStripeEvent failed:', err)
  }

  res.json({ received: true })
})

export { router as orderWebhookRouter }
