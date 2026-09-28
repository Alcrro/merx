import type { Request, Response, NextFunction } from 'express'
import type { BillingWebhookService } from '../../application/services/billing-webhook.service'
import { BillingError } from '../../domain/errors'
import { handleBillingError } from '../errors/billing.errors'

export interface BillingWebhookControllerDeps {
  billingWebhookService: BillingWebhookService
}

export function createBillingWebhookController({ billingWebhookService }: BillingWebhookControllerDeps) {
  return {
    // 400 on a bad signature (Stripe does not retry); any other failure → 500 so Stripe retries.
    handle: async (req: Request, res: Response, next: NextFunction) => {
      const signature = req.headers['stripe-signature']
      if (typeof signature !== 'string' || !Buffer.isBuffer(req.body)) {
        res.status(400).json({ error: 'Missing signature or raw body' })
        return
      }

      try {
        await billingWebhookService.handle(req.body, signature)
        res.json({ received: true })
      } catch (err) {
        if (err instanceof BillingError) handleBillingError(err, res); else next(err)
      }
    },
  }
}
