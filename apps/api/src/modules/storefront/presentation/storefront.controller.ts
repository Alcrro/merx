import type { Request, Response } from 'express'
import { storefrontService, StorefrontError } from '../application/storefront.service'
import { checkoutSchema } from './storefront.schema'

function handleError(err: unknown, res: Response) {
  if (err instanceof StorefrontError) {
    const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'OUT_OF_STOCK' ? 409 : 400
    res.status(status).json({ error: err.message })
    return
  }
  console.error('[storefront]', err)
  res.status(500).json({ error: 'Internal server error' })
}

export const storefrontController = {
  async getStore(req: Request, res: Response) {
    try {
      const store = await storefrontService.getStore(req.params.storeSlug)
      res.json(store)
    } catch (err) {
      handleError(err, res)
    }
  },

  async listProducts(req: Request, res: Response) {
    try {
      const store = await storefrontService.getStore(req.params.storeSlug)
      const page = Math.max(1, Number(req.query.page) || 1)
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
      const categoryId = req.query.categoryId as string | undefined
      const result = await storefrontService.listProducts(store.id, page, limit, categoryId)
      res.json(result)
    } catch (err) {
      handleError(err, res)
    }
  },

  async getProduct(req: Request, res: Response) {
    try {
      const store = await storefrontService.getStore(req.params.storeSlug)
      const product = await storefrontService.getProduct(store.id, req.params.productId)
      res.json(product)
    } catch (err) {
      handleError(err, res)
    }
  },

  async listCategories(req: Request, res: Response) {
    try {
      const store = await storefrontService.getStore(req.params.storeSlug)
      const categories = await storefrontService.listCategories(store.id)
      res.json(categories)
    } catch (err) {
      handleError(err, res)
    }
  },

  async checkout(req: Request, res: Response) {
    try {
      const parsed = checkoutSchema.safeParse(req.body)
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() })
        return
      }
      const result = await storefrontService.createCheckoutSession(req.params.storeSlug, parsed.data)
      res.json(result)
    } catch (err) {
      handleError(err, res)
    }
  },

  async orderConfirmation(req: Request, res: Response) {
    try {
      const sessionId = req.query.session_id as string
      if (!sessionId) {
        res.status(400).json({ error: 'Missing session_id' })
        return
      }
      const result = await storefrontService.getOrderConfirmation(sessionId)
      res.json(result)
    } catch (err) {
      handleError(err, res)
    }
  },

  async getStoreMeta(req: Request, res: Response) {
    try {
      const meta = await storefrontService.getStoreMeta(req.params.storeSlug)
      res.json(meta)
    } catch (err) {
      handleError(err, res)
    }
  },

  async getPublishedTheme(req: Request, res: Response) {
    try {
      const previewId = typeof req.query.previewId === 'string' ? req.query.previewId : null

      const config = previewId
        ? await storefrontService.getPreviewTheme(req.params.storeSlug, previewId)
        : await storefrontService.getPublishedTheme(req.params.storeSlug)

      if (!config) {
        res.status(404).json({ error: 'No published theme' })
        return
      }
      res.json({ config })
    } catch (err) {
      handleError(err, res)
    }
  },

  async stripeWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['stripe-signature'] as string
      if (!signature) {
        res.status(400).json({ error: 'Missing stripe-signature' })
        return
      }
      await storefrontService.handleStripeWebhook(req.body as Buffer, signature)
      res.json({ received: true })
    } catch (err) {
      if (err instanceof StorefrontError && err.code === 'INVALID') {
        res.status(400).json({ error: err.message })
        return
      }
      handleError(err, res)
    }
  },
}
