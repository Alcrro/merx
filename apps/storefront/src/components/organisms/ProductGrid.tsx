import { ProductCard } from '../molecules/ProductCard'
import type { PublicProduct } from '@/lib/api'

interface ProductGridProps {
  products: PublicProduct[]
  currency: string
}

export function ProductGrid({ products, currency }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p className="text-lg">Niciun produs găsit.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} currency={currency} />
      ))}
    </div>
  )
}
