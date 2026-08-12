import { Link } from 'react-router-dom'
import { useStore } from '../hooks/useStore'
import { useProducts } from '../hooks/useProducts'
import { ProductGrid } from '../components/organisms/ProductGrid'
import { Button } from '../components/atoms/Button'
import { useStoreSlug } from '../contexts/StoreSlugContext'

export function HomePage() {
  const storeSlug = useStoreSlug()
  const { data: store } = useStore(storeSlug)
  const { data, isLoading } = useProducts({ slug: storeSlug, limit: 8 })

  return (
    <div>
      <section className="bg-gray-50 py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">{store?.name}</h1>
        <p className="mt-4 text-lg text-gray-500">Browse our collection</p>
        <div className="mt-8">
          <Link to="/products">
            <Button size="lg">Shop now</Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">New arrivals</h2>
          <Link to="/products" className="text-sm text-gray-500 hover:text-gray-900">
            View all →
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <ProductGrid
            products={data?.data ?? []}
            currency={store?.currency ?? 'EUR'}
          />
        )}
      </section>
    </div>
  )
}
