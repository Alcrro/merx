import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale
  }

  const [common, nav, footer, home, contact, marketplace, pricing, auth, account, checkout] = await Promise.all([
    import(`../../messages/${locale}/common.json`),
    import(`../../messages/${locale}/nav.json`),
    import(`../../messages/${locale}/footer.json`),
    import(`../../messages/${locale}/home.json`),
    import(`../../messages/${locale}/contact.json`),
    import(`../../messages/${locale}/marketplace.json`),
    import(`../../messages/${locale}/pricing.json`),
    import(`../../messages/${locale}/auth.json`),
    import(`../../messages/${locale}/account.json`),
    import(`../../messages/${locale}/checkout.json`),
  ])

  return {
    locale,
    messages: {
      common: common.default,
      nav: nav.default,
      footer: footer.default,
      home: home.default,
      contact: contact.default,
      marketplace: marketplace.default,
      pricing: pricing.default,
      auth: auth.default,
      account: account.default,
      checkout: checkout.default,
    },
  }
})
