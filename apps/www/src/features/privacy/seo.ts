import type { Metadata } from 'next'

const BASE_URL = 'https://merx.com'
const DESCRIPTION = 'Cum colectăm, utilizăm și protejăm datele tale pe platforma Merx, conform GDPR.'

export const metadata: Metadata = {
  title: 'Politica de Confidențialitate',
  description: DESCRIPTION,
  openGraph: {
    title: 'Politica de Confidențialitate | Merx',
    description: DESCRIPTION,
    url: `${BASE_URL}/privacy`,
    siteName: 'Merx',
    locale: 'ro_RO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Politica de Confidențialitate | Merx',
    description: DESCRIPTION,
  },
  robots: { index: true, follow: false },
}

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Politica de Confidențialitate | Merx',
  url: `${BASE_URL}/privacy`,
  description: DESCRIPTION,
  publisher: { '@type': 'Organization', name: 'Merx', url: BASE_URL },
}
