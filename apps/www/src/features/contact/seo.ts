import type { Metadata } from 'next'
import { getAlternates } from '@/config/seo'

const BASE_URL = 'https://merx.com'
const DESCRIPTION = 'Contactează echipa Merx — vânzări, suport tehnic, legal sau presă. Răspundem în maxim 24h.'

export const metadata: Metadata = {
  title: 'Contact',
  description: DESCRIPTION,
  openGraph: {
    title: 'Contact | Merx',
    description: DESCRIPTION,
    url: `${BASE_URL}/contact`,
    siteName: 'Merx',
    locale: 'ro_RO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | Merx',
    description: DESCRIPTION,
  },
  alternates: getAlternates('/contact'),
  keywords: ['contact merx', 'suport merx', 'ajutor magazin online'],
  robots: { index: true, follow: true },
}

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact | Merx',
  url: `${BASE_URL}/contact`,
  description: DESCRIPTION,
  publisher: {
    '@type': 'Organization',
    name: 'Merx',
    url: BASE_URL,
  },
}
