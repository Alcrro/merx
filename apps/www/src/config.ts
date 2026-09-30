function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env var: ${key}`)
  return value
}

export const config = {
  isProd: process.env.NODE_ENV === 'production',
  api: {
    url: requireEnv('NEXT_PUBLIC_API_URL'),
  },
  urls: {
    www: process.env.NEXT_PUBLIC_WWW_URL ?? '',
    dashboard: process.env.NEXT_PUBLIC_DASHBOARD_URL ?? '',
    docs: process.env.NEXT_PUBLIC_DOCS_URL ?? '',
  },
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
  },
  email: {
    apiKey: process.env.RESEND_API_KEY ?? '',
  },
} as const
