import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.integration.test.ts'],
    setupFiles: ['src/tests/setup/load-test-env.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    singleFork: true,
  },
})
