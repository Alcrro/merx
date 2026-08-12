import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '../atoms/Badge'
import { useCart } from '../../contexts/CartContext'
import type { PublicProduct } from '../../lib/api'

interface ProductCardProps {
  product: PublicProduct
  currency: string
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)
}

export function ProductCard({ product, currency }: ProductCardProps) {
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [added, setAdded] = useState(false)

  const defaultVariant = product.variants[0]
  const minPrice = Math.min(...product.variants.map((v) => v.price))
  const hasSale = product.variants.some((v) => v.compareAtPrice && v.compareAtPrice > v.price)
  const hasMultipleVariants = product.variants.length > 1

  function handleQuickAdd() {
    if (hasMultipleVariants) {
      navigate(`/products/${product.id}`)
      return
    }
    if (!defaultVariant) return
    addItem({
      variantId: defaultVariant.id,
      productId: product.id,
      productTitle: product.title,
      variantTitle: defaultVariant.title,
      price: defaultVariant.price,
      quantity: 1,
      sku: defaultVariant.sku,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="group flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          <span className="text-4xl text-gray-300">📦</span>
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        {product.category && (
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category.name}
          </span>
        )}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>
        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
        )}
        <div className="mt-auto flex items-center gap-2">
          <span className="font-semibold text-gray-900">{formatPrice(minPrice, currency)}</span>
          {defaultVariant?.compareAtPrice && defaultVariant.compareAtPrice > defaultVariant.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(defaultVariant.compareAtPrice, currency)}
            </span>
          )}
          {hasSale && <Badge variant="sale">Sale</Badge>}
        </div>

        <button
          onClick={handleQuickAdd}
          className="mt-1 w-full rounded border border-gray-900 py-1.5 text-xs font-medium text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
        >
          {added
            ? '✓ Added'
            : hasMultipleVariants
            ? `Choose options (${product.variants.length})`
            : 'Add to cart'}
        </button>
      </div>
    </div>
  )
}
