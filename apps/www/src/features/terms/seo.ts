import type { Metadata } from 'next'

const BASE_URL = 'https://merx.com'
const DESCRIPTION = 'Termenii și condițiile de utilizare ale platformei Merx.'

export const metadata: Metadata = {
  title: 'Termeni și Condiții',
  description: DESCRIPTION,
  openGraph: {
    title: 'Termeni și Condiții | Merx',
    description: DESCRIPTION,
    url: `${BASE_URL}/terms`,
    siteName: 'Merx',
    locale: 'ro_RO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Termeni și Condiții | Merx',
    description: DESCRIPTION,
  },
  robots: { index: true, follow: false },
}

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Termeni și Condiții | Merx',
  url: `${BASE_URL}/terms`,
  description: DESCRIPTION,
  publisher: { '@type': 'Organization', name: 'Merx', url: BASE_URL },
}
