import 'dotenv/config'
import { config } from '../config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { authRouter } from '../modules/auth/presentation/auth.router'
import { storeRouter } from '../modules/stores/presentation/store.router'
import { productRouter, categoryRouter } from '../modules/products/presentation/product.router'
import { orderRouter } from '../modules/orders/presentation/order.router'
import { inventoryRouter } from '../modules/inventory/presentation/inventory.router'
import { analyticsRouter } from '../modules/analytics/presentation/analytics.router'
import { startAnalyticsWorker } from '../modules/analytics/infrastructure/metrics.job'
import { startInsightsWorker } from '../modules/ai/infrastructure/insights.job'
import { aiRouter } from '../modules/ai/presentation/ai.router'
import { storefrontRouter, webhookRouter } from '../modules/storefront/presentation/storefront.router'
import { errorHandler } from '../middleware/error-handler'

const app = express()
const PORT = config.server.port

app.use(helmet())
app.use(
  cors({
    origin: [config.server.dashboardUrl, config.server.storefrontUrl],
    credentials: true,
  })
)

// Raw body for Stripe webhook — must come before express.json()
app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }), webhookRouter)

app.use(express.json())

app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
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

app.use(errorHandler)

app.listen(Number(PORT), () => {
  console.log(`[api] running on http://localhost:${PORT}`)
  startAnalyticsWorker()
  startInsightsWorker()
})

export default app
