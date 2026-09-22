import type { Metadata } from 'next'
import { PLAN_CONFIG } from '@merx/types'
import { getAlternates } from '@/config/seo'

const BASE_URL = 'https://merx.com'
const DESCRIPTION = 'Planuri Merx de la €19/lună. 14 zile trial gratuit pe Starter, fără card.'

export const metadata: Metadata = {
  title: 'Prețuri',
  description: DESCRIPTION,
  keywords: ['prețuri merx', 'abonament ecommerce', 'platformă magazin online', 'SaaS România', 'plan starter', 'plan pro'],
  openGraph: {
    title: 'Prețuri | Merx',
    description: DESCRIPTION,
    url: `${BASE_URL}/pricing`,
    siteName: 'Merx',
    locale: 'ro_RO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prețuri | Merx',
    description: DESCRIPTION,
  },
  alternates: getAlternates('/pricing'),
  robots: { index: true, follow: true },
}

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Pricing | Merx',
  url: `${BASE_URL}/pricing`,
  description: DESCRIPTION,
  offers: Object.values(PLAN_CONFIG)
    .filter((p) => p.price !== null)
    .map((p) => ({
      '@type': 'Offer',
      name: p.name,
      price: String(p.price),
      priceCurrency: 'EUR',
    })),
}
