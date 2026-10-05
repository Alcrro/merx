import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    exclude: ['src/**/*.integration.test.ts'],
    // auth use cases import src/config.ts, which requires these at import time; unit tests never use them
    env: {
      JWT_SECRET: 'unit-test-secret',
      DATABASE_URL: 'postgresql://unit:test@localhost:5432/unit',
      STRIPE_SECRET_KEY: 'sk_test_unit',
      STRIPE_WEBHOOK_SECRET: 'whsec_unit',
    },
    coverage: {
      provider: 'v8',
      include: ['src/modules/**'],
      exclude: ['src/modules/**/infrastructure/**', 'src/modules/**/presentation/**'],
    },
  },
})
