import { cache } from 'react'
import { headers } from 'next/headers'
import Link from 'next/link'
import Script from 'next/script'
import { storefrontApi, storeCanonicalOrigin } from '@/lib/api'
import { getTheme } from '@/lib/theme'
import { HeroSection } from '@/components/theme/sections/HeroSection'
import { FeaturedProductsSection } from '@/components/theme/sections/FeaturedProductsSection'
import { ProductGrid } from '@/components/organisms/ProductGrid'

const getSlugAndPreview = cache(async () => {
  const h = await headers()
  return {
    slug: h.get('x-store-slug') ?? '',
    previewId: h.get('x-preview-id') ?? null,
  }
})

export default async function HomePage() {
  const { slug, previewId } = await getSlugAndPreview()

  const [store, theme] = await Promise.all([
    slug ? storefrontApi.getStore(slug).catch(() => null) : Promise.resolve(null),
    slug ? getTheme(slug, previewId) : Promise.resolve(null),
  ])

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <p className="text-5xl mb-6">🏪</p>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Magazin negăsit</h1>
        <p className="text-gray-500 text-sm">Verifică adresa și încearcă din nou.</p>
      </div>
    )
  }

  const puckContent = theme?.pages.home.puckData.content ?? []
  const hasContent = puckContent.length > 0
  const origin = storeCanonicalOrigin(store)

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: store.name,
    url: origin,
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: store.name,
    url: origin,
  }

  const jsonLdBlock = (
    <>
      <Script id="org-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <Script id="website-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
    </>
  )

  // ─── Theme-driven render ──────────────────────────────────────────────────────
  if (hasContent) {
    return (
      <div>
        {jsonLdBlock}
        {puckContent.map((section) => {
          const p = section.props
          const id = String(p.id ?? section.type)

          if (section.type === 'Hero') {
            return (
              <HeroSection
                key={id}
                props={{
                  image: (p.image as string) || null,
                  headline: p.headline as string,
                  subtitle: (p.subtitle as string) || null,
                  ctaLabel: p.ctaLabel as string,
                  ctaTarget: p.ctaTarget as 'shop' | 'collection',
                  collectionId: (p.collectionId as string) || null,
                  overlayOpacity: p.overlayOpacity as number,
                }}
                storeName={store.name}
              />
            )
          }
          if (section.type === 'FeaturedProducts') {
            return (
              <FeaturedProductsSection
                key={id}
                props={{
                  title: p.title as string,
                  source: p.source as 'new_arrivals' | 'collection' | 'manual',
                  collectionId: (p.collectionId as string) || null,
                  limit: p.limit as number,
                }}
                slug={slug}
                currency={store.currency}
              />
            )
          }
          return null
        })}
      </div>
    )
  }

  // ─── Fallback (no published theme / no sections) ──────────────────────────────
  const arrivals = await storefrontApi.listProducts(slug, { limit: 8 }).catch(() => null)

  return (
    <div>
      {jsonLdBlock}
      <section className="bg-gray-50 py-24 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl tracking-tight">
          {store.name}
        </h1>
        <p className="mt-4 text-lg text-gray-500">Explorează colecția noastră</p>
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 rounded bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Cumpără acum
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Noutăți</h2>
          <Link href="/products" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Vezi toate →
          </Link>
        </div>

        {arrivals && arrivals.data.length > 0 ? (
          <ProductGrid products={arrivals.data} currency={store.currency} />
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
