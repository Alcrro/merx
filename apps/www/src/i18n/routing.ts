import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'ro'] as const,
  defaultLocale: 'en',
  localePrefix: 'as-needed', // / for en (default), /ro for Romanian
  localeDetection: true,
})

export type Locale = (typeof routing.locales)[number]
