import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProduct } from '../hooks/useProduct'
import { useStore } from '../hooks/useStore'
import { useProducts } from '../hooks/useProducts'
import { useCart } from '../contexts/CartContext'
import { useStoreSlug } from '../contexts/StoreSlugContext'
import { Button } from '../components/atoms/Button'
import { Badge } from '../components/atoms/Badge'
import { ProductGrid } from '../components/organisms/ProductGrid'
import type { PublicVariant } from '../lib/api'

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)
}

function StockBadge({ inventory }: { inventory: number | null }) {
  if (inventory === null) return null
  if (inventory === 0) return <span className="text-sm font-medium text-red-600">Out of stock</span>
  if (inventory <= 5) return <span className="text-sm font-medium text-amber-600">Only {inventory} left</span>
  return <span className="text-sm font-medium text-green-600">In stock</span>
}

export function ProductDetailPage() {
  const storeSlug = useStoreSlug()
  const { productId = '' } = useParams()
  const { data: store } = useStore(storeSlug)
  const { data: product, isLoading, error } = useProduct(storeSlug, productId)
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<PublicVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const currency = store?.currency ?? 'EUR'
  const variant = selectedVariant ?? product?.variants[0] ?? null
  const outOfStock = variant?.inventory === 0

  const { data: relatedData } = useProducts({
    slug: storeSlug,
    categoryId: product?.category?.id,
    limit: 5,
  })
  const related = relatedData?.data.filter((p) => p.id !== productId).slice(0, 4) ?? []

  function handleAddToCart() {
    if (!product || !variant || outOfStock) return
    addItem({
      variantId: variant.id,
      productId: product.id,
      productTitle: product.title,
      variantTitle: variant.title,
      price: variant.price,
      quantity,
      sku: variant.sku,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
          <div className="h-6 bg-gray-100 rounded w-1/3 animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 text-center">
        <p className="text-gray-500">Product not found.</p>
        <Link to="/products" className="mt-4 inline-block text-sm text-gray-900 underline">
          Back to products
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/products" className="text-sm text-gray-500 hover:text-gray-900 mb-8 inline-block">
        ← All products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-8xl text-gray-300">📦</span>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {product.category && (
            <span className="text-sm text-gray-500 uppercase tracking-wide">{product.category.name}</span>
          )}

          <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

          {/* Price + stock */}
          {variant && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl font-semibold">{formatPrice(variant.price, currency)}</span>
              {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(variant.compareAtPrice, currency)}
                  </span>
                  <Badge variant="sale">Sale</Badge>
                </>
              )}
              <StockBadge inventory={variant.inventory} />
            </div>
          )}

          {product.description && (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {/* Variants */}
          {product.variants.length > 1 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Options</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => { setSelectedVariant(v); setQuantity(1) }}
                    disabled={v.inventory === 0}
                    className={`rounded border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      (selectedVariant ?? product.variants[0])?.id === v.id
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SKU */}
          {variant?.sku && (
            <p className="text-xs text-gray-400">SKU: {variant.sku}</p>
          )}

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(variant?.inventory ?? 99, q + 1))}
                disabled={variant?.inventory !== null && quantity >= (variant?.inventory ?? 99)}
                className="w-9 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>

            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex-1"
            >
              {added ? '✓ Added to cart' : outOfStock ? 'Out of stock' : 'Add to cart'}
            </Button>

            <Link to="/cart">
              <Button variant="secondary" size="lg">Cart</Button>
            </Link>
          </div>

          {product.vendor && (
            <p className="text-sm text-gray-400">By {product.vendor}</p>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">You might also like</h2>
          <ProductGrid products={related} currency={currency} />
        </div>
      )}
    </div>
  )
}
