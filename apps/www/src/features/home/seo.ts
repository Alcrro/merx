import type { Metadata } from 'next'
import { getAlternates } from '@/config/seo'

const BASE_URL = 'https://merx.com'
const DESCRIPTION = 'Merx îți gestionează comenzile, stocul și clienții automat. Tu te ocupi de produse — restul îl face AI-ul.'

export const metadata: Metadata = {
  title: { absolute: 'Merx — Magazinul tău online, operat de AI' },
  description: DESCRIPTION,
  alternates: getAlternates('/'),
  openGraph: {
    title: 'Merx — Magazinul tău online, operat de AI',
    description: DESCRIPTION,
    url: BASE_URL,
    siteName: 'Merx',
    locale: 'ro_RO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Merx — Magazinul tău online, operat de AI',
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
}

export const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Merx',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/icon.svg`,
    },
    description: 'Platformă ecommerce AI-native pentru antreprenori români.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@merx.com',
      contactType: 'customer service',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Merx',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: BASE_URL,
    description: DESCRIPTION,
    offers: {
      '@type': 'Offer',
      price: '19',
      priceCurrency: 'EUR',
    },
  },
]
