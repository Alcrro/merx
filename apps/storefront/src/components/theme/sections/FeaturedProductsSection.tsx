import Link from 'next/link'
import { storefrontApi } from '@/lib/api'
import { ProductGrid } from '@/components/organisms/ProductGrid'
import type { FeaturedProductsSectionProps } from '@/lib/theme'

interface FeaturedProductsSectionComponentProps {
  props: FeaturedProductsSectionProps
  slug: string
  currency: string
}

export async function FeaturedProductsSection({
  props,
  slug,
  currency,
}: FeaturedProductsSectionComponentProps) {
  const { title, source, collectionId, limit } = props

  const params =
    source === 'collection' && collectionId
      ? { limit, categoryId: collectionId }
      : { limit }

  const result = await storefrontApi.listProducts(slug, params).catch(() => null)
  const products = result?.data ?? []

  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h2>
        <Link
          href="/products"
          className="text-sm transition-colors hover:opacity-75"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Vezi toate →
        </Link>
      </div>

      <ProductGrid products={products} currency={currency} />
    </section>
  )
}
