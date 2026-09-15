import { Suspense } from 'react'
import { headers } from 'next/headers'
import Script from 'next/script'
import type { Metadata } from 'next'
import { storefrontApi, storeCanonicalOrigin } from '@/lib/api'
import { ProductGrid } from '@/components/organisms/ProductGrid'
import { CategoryFilter } from '@/components/molecules/CategoryFilter'
import { Pagination } from '@/components/molecules/Pagination'

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const slug = h.get('x-store-slug') ?? ''
  const store = slug ? await storefrontApi.getStore(slug).catch(() => null) : null
  const storeName = store?.name ?? 'Merx Store'
  return {
    title: `Produse | ${storeName}`,
    description: `Toate produsele din ${storeName}`,
    ...(store ? { alternates: { canonical: '/products' } } : {}),
  }
}

const PAGE_SIZE = 20

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoryId?: string }>
}) {
  const { page: pageStr, categoryId } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10))

  const h = await headers()
  const slug = h.get('x-store-slug') ?? ''

  const [store, products, categories] = await Promise.all([
    slug ? storefrontApi.getStore(slug).catch(() => null) : Promise.resolve(null),
    slug
      ? storefrontApi.listProducts(slug, { page, limit: PAGE_SIZE, categoryId }).catch(() => null)
      : Promise.resolve(null),
    slug ? storefrontApi.listCategories(slug).catch(() => []) : Promise.resolve([]),
  ])

  const currency = store?.currency ?? 'EUR'
  const totalPages = products ? Math.ceil(products.total / PAGE_SIZE) : 0
  const origin = store ? storeCanonicalOrigin(store) : null

  const breadcrumbJsonLd = origin
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Acasă', item: origin },
          { '@type': 'ListItem', position: 2, name: 'Produse', item: `${origin}/products` },
        ],
      }
    : null

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {breadcrumbJsonLd && (
        <Script id="breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Toate produsele</h1>

      {/* CategoryFilter uses useSearchParams → Suspense boundary required */}
      {categories.length > 0 && (
        <Suspense fallback={null}>
          <CategoryFilter categories={categories} />
        </Suspense>
      )}

      {!products ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : products.data.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <p className="text-lg">Niciun produs în această categorie.</p>
        </div>
      ) : (
        <ProductGrid products={products.data} currency={currency} />
      )}

      {/* Pagination uses useSearchParams → Suspense boundary required */}
      <Suspense fallback={null}>
        <Pagination page={page} totalPages={totalPages} />
      </Suspense>
    </div>
  )
}
