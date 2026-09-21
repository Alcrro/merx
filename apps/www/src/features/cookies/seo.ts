import type { Metadata } from 'next'

const BASE_URL = 'https://merx.com'
const DESCRIPTION = 'Cum utilizăm cookie-urile pe platforma Merx și cum le poți controla.'

export const metadata: Metadata = {
  title: 'Politica de Cookies',
  description: DESCRIPTION,
  openGraph: {
    title: 'Politica de Cookies | Merx',
    description: DESCRIPTION,
    url: `${BASE_URL}/cookies`,
    siteName: 'Merx',
    locale: 'ro_RO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Politica de Cookies | Merx',
    description: DESCRIPTION,
  },
  robots: { index: true, follow: false },
}

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Politica de Cookies | Merx',
  url: `${BASE_URL}/cookies`,
  description: DESCRIPTION,
  publisher: { '@type': 'Organization', name: 'Merx', url: BASE_URL },
}
