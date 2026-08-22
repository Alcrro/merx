import 'dotenv/config'
import { config } from '../config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { authRouter } from '../modules/auth/auth.router'
import { storeRouter } from '../modules/stores/presentation/store.router'
import { productRouter, categoryRouter } from '../modules/products/presentation/product.router'
import { orderRouter } from '../modules/orders/order.router'
import { inventoryRouter } from '../modules/inventory/presentation/inventory.router'
import { analyticsRouter } from '../modules/analytics/presentation/analytics.router'
import { startAnalyticsWorker } from '../modules/analytics/infrastructure/metrics.job'
import { startInsightsWorker } from '../modules/ai/infrastructure/insights.job'
import { aiRouter } from '../modules/ai/presentation/ai.router'
import { storefrontRouter, webhookRouter } from '../modules/storefront/presentation/storefront.router'
import { customerRouter } from '../modules/customers/presentation/customer.router'
import { paymentsRouter, paymentsWebhookRouter } from '../modules/payments/payments.router'
import { startPaymentsWorkers } from '../modules/payments/container'
import { marketplaceRouter } from '../modules/marketplace/presentation/marketplace.router'
import { startExpireListingsWorker } from '../modules/marketplace/infrastructure/expire-listings.job'
import { startResetQuotaWorker } from '../modules/marketplace/infrastructure/reset-quota.job'
import { discountRouter } from '../modules/discounts/presentation/discount.router'
import { startReleaseOrphansWorker } from '../modules/discounts/infrastructure/release-orphans.job'
import { catalogRouter, adminCatalogRouter } from '../modules/catalog/catalog.router'
import { productRequestRouter, adminProductRequestRouter } from '../modules/product-requests/presentation/product-request.router'
import { aiToolCriteriaRouter } from '../modules/ai-tool-criteria/presentation/ai-tool-criteria.router'
import { themeRouter } from '../modules/storefront-theme/presentation/theme.router'
import { shippingRouter } from '../modules/shipping/presentation/shipping.router'
import { startModerateContentWorker } from '../modules/catalog/infrastructure/queue/moderate-content.job'
import { startAutoArchiveWorker } from '../modules/catalog/infrastructure/queue/auto-archive.job'
import { startGenerateCatalogProductWorker } from '../modules/product-requests/infrastructure/generate-catalog-product.job'
import { notificationRouter } from '../modules/notifications/presentation/notification.router'
import { NotificationService } from '../modules/notifications/application/notification.service'
import { NotificationRepository } from '../modules/notifications/infrastructure/notification.repository'
import { introRouter } from '../modules/profile/profile.router'
import { errorHandler } from '../middleware/error-handler'

const app = express()
const PORT = config.server.port

app.set('trust proxy', 1)
app.use(helmet())
app.use(
  cors({
    origin: [config.server.dashboardUrl, config.server.storefrontUrl],
    credentials: true,
  })
)

// Raw body for Stripe webhooks — must come before express.json()
app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }), webhookRouter)
app.use('/api/v1/payments/webhooks', express.raw({ type: 'application/json' }), paymentsWebhookRouter)

app.use(express.json())

app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/v1/config/public', (_req, res) => {
  res.json({ stripePublishableKey: config.stripe.publishableKey })
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/stores', storeRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/product-categories', categoryRouter)
app.use('/api/v1/orders', orderRouter)
app.use('/api/v1/inventory', inventoryRouter)
app.use('/api/v1/analytics', analyticsRouter)
app.use('/api/v1/ai/sessions', aiRouter)
app.use('/api/v1/storefront', storefrontRouter)
app.use('/api/v1/customers', customerRouter)
app.use('/api/v1/payments', paymentsRouter)
app.use('/api/v1/marketplace', marketplaceRouter)
app.use('/api/v1/discounts', discountRouter)
app.use('/api/v1/catalog', catalogRouter)
app.use('/api/v1/product-requests', productRequestRouter)
app.use('/api/v1/admin/catalog', adminCatalogRouter)
app.use('/api/v1/admin/product-requests', adminProductRequestRouter)
app.use('/api/v1/admin/ai-tools', aiToolCriteriaRouter)
app.use('/api/v1/theme', themeRouter)
app.use('/api/v1/shipping-methods', shippingRouter)
app.use('/api/v1/stores/:storeId/notifications', notificationRouter)
app.use('/api/v1/users/intro', introRouter)

app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') app.listen(Number(PORT), () => {
  console.log(`[api] running on http://localhost:${PORT}`)
  // Workers dezactivate temporar — Upstash free tier epuizat
  // startAnalyticsWorker()
  // startInsightsWorker()
  // startPaymentsWorkers()
  // startExpireListingsWorker()
  // startResetQuotaWorker()
  // startReleaseOrphansWorker()
  // startModerateContentWorker()
  // startAutoArchiveWorker()
  // startGenerateCatalogProductWorker()
  // const notificationService = new NotificationService(new NotificationRepository())
  // void notificationService.deleteOlderThan(30)
  // setInterval(() => void notificationService.deleteOlderThan(30), 24 * 60 * 60 * 1000)
})

export default app
