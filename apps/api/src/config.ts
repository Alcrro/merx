function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env var: ${key}`)
  return value
}

export const config = {
  auth: {
    jwtSecret: requireEnv('JWT_SECRET'),
    jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET'),
  },
  server: {
    port: process.env.PORT ?? '3001',
    dashboardUrl: process.env.DASHBOARD_URL ?? 'http://localhost:3000',
    storefrontUrl: process.env.STOREFRONT_URL ?? 'http://localhost:3002',
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
  },
} as const
