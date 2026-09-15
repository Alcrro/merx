import { cache } from 'react'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { Providers } from './providers'
import { StorefrontHeader } from '@/components/templates/StorefrontHeader'
import { storefrontApi, storeCanonicalOrigin, formatTitle } from '@/lib/api'
import type { PublicStore } from '@/lib/api'
import { getTheme } from '@/lib/theme'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { StorefrontFooter } from '@/components/templates/StorefrontFooter'
import './globals.css'

// cache() deduplicates: generateMetadata + RootLayout share the same fetch result
const getStore = cache(async (slug: string): Promise<PublicStore | null> => {
  if (!slug) return null
  try {
    return await storefrontApi.getStore(slug)
  } catch {
    return null
  }
})

async function getSlugAndPreview(): Promise<{ slug: string; previewId: string | null }> {
  const h = await headers()
  return {
    slug: h.get('x-store-slug') ?? '',
    previewId: h.get('x-preview-id') ?? null,
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { slug, previewId } = await getSlugAndPreview()
  const [store, theme] = await Promise.all([
    getStore(slug),
    slug ? getTheme(slug, previewId) : Promise.resolve(null),
  ])

  const storeName = store?.name ?? 'Merx Store'
  const template = theme?.seo.titleTemplate ?? '%s'
  const description = theme?.seo.defaultDescription || (store ? `Cumpără din ${storeName}` : undefined)
  const origin = store ? storeCanonicalOrigin(store) : null

  return {
    title: {
      default: formatTitle(storeName, template),
      template,
    },
    description,
    ...(origin ? { metadataBase: new URL(origin) } : {}),
    alternates: origin ? { canonical: '/' } : {},
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { slug, previewId } = await getSlugAndPreview()
  const [store, theme] = await Promise.all([getStore(slug), slug ? getTheme(slug, previewId) : Promise.resolve(null)])

  return (
    <html lang="ro">
      <head>
        {theme && <ThemeProvider tokens={theme.tokens} />}
      </head>
      <body className="min-h-screen bg-white flex flex-col">
        <Providers store={store} slug={slug}>
          <StorefrontHeader />
          <main className="flex-1">{children}</main>
          <StorefrontFooter storeName={store?.name ?? 'Merx'} />
        </Providers>
      </body>
    </html>
  )
}
