import { headers } from 'next/headers'
import Link from 'next/link'
import Script from 'next/script'
import type { Metadata } from 'next'
import { storefrontApi, storeCanonicalOrigin, formatTitle } from '@/lib/api'
import { getPublishedTheme } from '@/lib/theme'
import { ProductDetailClient } from '@/components/organisms/ProductDetailClient'
import { ProductGrid } from '@/components/organisms/ProductGrid'

interface Props { params: Promise<{ productId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params
  const h = await headers()
  const slug = h.get('x-store-slug') ?? ''
  try {
    const [product, store, theme] = await Promise.all([
      storefrontApi.getProduct(slug, productId),
      storefrontApi.getStore(slug).catch(() => null),
      getPublishedTheme(slug),
    ])
    const template = theme?.seo.titleTemplate ?? '%s'
    const origin = store ? storeCanonicalOrigin(store) : null
    return {
      title: formatTitle(product.title, template),
      description: product.description ?? undefined,
      ...(origin ? { alternates: { canonical: `/products/${productId}` } } : {}),
    }
  } catch {
    return { title: 'Produs' }
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { productId } = await params
  const h = await headers()
  const slug = h.get('x-store-slug') ?? ''

  const [store, product] = await Promise.all([
    slug ? storefrontApi.getStore(slug).catch(() => null) : Promise.resolve(null),
    slug ? storefrontApi.getProduct(slug, productId).catch(() => null) : Promise.resolve(null),
  ])

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 text-center">
        <p className="text-gray-500 mb-4">Produsul nu a fost găsit.</p>
        <Link href="/products" className="text-sm text-gray-900 underline">
          ← Înapoi la produse
        </Link>
      </div>
    )
  }

  const currency = store?.currency ?? 'EUR'
  const origin = store ? storeCanonicalOrigin(store) : null

  const minPrice = Math.min(...product.variants.map((v) => v.price))
  const inStock = product.variants.some((v) => v.inventory === null || v.inventory > 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    ...(product.description ? { description: product.description } : {}),
    ...(origin ? { url: `${origin}/products/${product.id}` } : {}),
    offers: {
      '@type': 'Offer',
      price: minPrice.toFixed(2),
      priceCurrency: currency,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      ...(origin ? { url: `${origin}/products/${product.id}` } : {}),
    },
  }

  const breadcrumbJsonLd = origin
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Acasă', item: origin },
          { '@type': 'ListItem', position: 2, name: 'Produse', item: `${origin}/products` },
          { '@type': 'ListItem', position: 3, name: product.title, item: `${origin}/products/${product.id}` },
        ],
      }
    : null

  // Related: same category, exclude current product, max 4
  const related = product.category
    ? await storefrontApi
        .listProducts(slug, { categoryId: product.category.id, limit: 5 })
        .then((r) => r.data.filter((p) => p.id !== productId).slice(0, 4))
        .catch(() => [])
    : []

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <Script id="product-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {breadcrumbJsonLd && (
        <Script id="breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      )}

      <Link href="/products" className="text-sm text-gray-500 hover:text-gray-900 mb-8 inline-block transition-colors">
        ← Toate produsele
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Placeholder image */}
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-8xl text-gray-300">📦</span>
        </div>

        {/* Interactive section — Client Component */}
        <ProductDetailClient product={product} />
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">S-ar putea să îți placă și</h2>
          <ProductGrid products={related} currency={currency} />
        </div>
      )}
    </div>
  )
}
