import type { Metadata } from 'next'

const BASE_URL = 'https://merx.com'

export function getAlternates(path: string) {
  const suffix = path === '/' ? '' : path
  return {
    canonical: `${BASE_URL}${suffix}`,
    languages: {
      'en': `${BASE_URL}${suffix}`,
      'ro': `${BASE_URL}/ro${suffix}`,
      'x-default': `${BASE_URL}${suffix}`,
    },
  }
}

export const siteConfig = {
  name: 'Merx',
  url: 'https://merx.com',
  locale: 'ro_RO',
  defaultTitle: 'Merx — Magazinul tău online, operat de AI',
  defaultDescription: 'Merx este platforma ecommerce care îți gestionează magazinul cu AI. Comenzi, stoc, clienți, analytics — totul automat.',
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.defaultDescription,
  keywords: ['ecommerce', 'magazin online', 'AI', 'platform', 'merx'],
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
  },
  robots: { index: true, follow: true },
}
