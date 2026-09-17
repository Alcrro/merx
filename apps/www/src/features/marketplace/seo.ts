export const BASE_URL = 'https://merx.com'

export function buildJsonLd(schema: { description: string; offerDescription: string }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Marketplace | Merx',
        url: `${BASE_URL}/marketplace`,
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Merx Marketplace',
        applicationCategory: 'BusinessApplication',
        description: schema.description,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          description: schema.offerDescription,
        },
      },
    ],
  }
}
