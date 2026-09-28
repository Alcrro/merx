function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env var: ${key}`)
  return value
}

export const config = {
  auth: {
    jwtSecret: requireEnv('JWT_SECRET'),
  },
  server: {
    port: process.env.PORT ?? '3001',
    dashboardUrl: process.env.DASHBOARD_URL ?? 'http://localhost:3000',
    storefrontUrl: process.env.STOREFRONT_URL ?? 'http://localhost:3002',
    wwwUrl: process.env.WWW_URL ?? 'http://localhost:3003',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  },
  db: {
    url: requireEnv('DATABASE_URL'),
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  stripe: {
    secretKey: requireEnv('STRIPE_SECRET_KEY'),
    webhookSecret: requireEnv('STRIPE_WEBHOOK_SECRET'),
    connectWebhookSecret: process.env.STRIPE_CONNECT_WEBHOOK_SECRET ?? requireEnv('STRIPE_WEBHOOK_SECRET'),
    // Each Stripe endpoint has its own signing secret; the fallback covers local `stripe listen` (one secret for all).
    billingWebhookSecret: process.env.STRIPE_BILLING_WEBHOOK_SECRET ?? requireEnv('STRIPE_WEBHOOK_SECRET'),
    ordersWebhookSecret: process.env.STRIPE_ORDERS_WEBHOOK_SECRET ?? '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? '',
    prices: {
      starter: process.env.STRIPE_PRICE_ID_STARTER ?? '',
      pro: process.env.STRIPE_PRICE_ID_PRO ?? '',
      scale: process.env.STRIPE_PRICE_ID_SCALE ?? '',
    },
  },
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT ?? '',
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? '',
    bucket: process.env.STORAGE_BUCKET ?? 'merx-assets',
    publicUrl: process.env.STORAGE_PUBLIC_URL ?? '',
    region: process.env.STORAGE_REGION ?? 'auto',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
  },
  pexels: {
    apiKey: process.env.PEXELS_API_KEY ?? '',
  },
  email: {
    apiKey: process.env.RESEND_API_KEY ?? '',
    from: process.env.EMAIL_FROM ?? 'noreply@merx.com',
    appUrl: process.env.APP_URL ?? 'http://localhost:3003',
  },
} as const
