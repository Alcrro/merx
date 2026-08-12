import { ProductCard } from '../molecules/ProductCard'
import type { PublicProduct } from '../../lib/api'

interface ProductGridProps {
  products: PublicProduct[]
  currency: string
}

export function ProductGrid({ products, currency }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">No products available yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} currency={currency} />
      ))}
    </div>
  )
}
