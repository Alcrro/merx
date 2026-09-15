'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { useCart } from '@/contexts/CartContext'
import { useStore } from '@/contexts/StoreContext'
import { formatPrice } from '@/lib/api'
import type { PublicProduct, PublicVariant } from '@/lib/api'

function StockBadge({ inventory }: { inventory: number | null }) {
  if (inventory === null) return null
  if (inventory === 0) return <Badge variant="outOfStock">Stoc epuizat</Badge>
  if (inventory <= 5) return <Badge variant="lowStock">Ultimele {inventory} bucăți</Badge>
  return <Badge>În stoc</Badge>
}

export function ProductDetailClient({ product }: { product: PublicProduct }) {
  const { store } = useStore()
  const { addItem } = useCart()
  const currency = store?.currency ?? 'EUR'

  const [selectedVariant, setSelectedVariant] = useState<PublicVariant>(product.variants[0])
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const outOfStock = selectedVariant.inventory === 0
  const maxQty = selectedVariant.inventory ?? 99

  function handleVariantChange(v: PublicVariant) {
    setSelectedVariant(v)
    setQuantity(1)
  }

  function handleAddToCart() {
    if (outOfStock) return
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productTitle: product.title,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      sku: selectedVariant.sku,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      {product.category && (
        <span className="text-sm text-gray-500 uppercase tracking-wide">
          {product.category.name}
        </span>
      )}

      <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

      {/* Price + stock */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-2xl font-semibold">
          {formatPrice(selectedVariant.price, currency)}
        </span>
        {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
          <>
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(selectedVariant.compareAtPrice, currency)}
            </span>
            <Badge variant="sale">Sale</Badge>
          </>
        )}
        <StockBadge inventory={selectedVariant.inventory} />
      </div>

      {product.description && (
        <p className="text-gray-600 leading-relaxed">{product.description}</p>
      )}

      {/* Variant selector */}
      {product.variants.length > 1 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Opțiuni</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => handleVariantChange(v)}
                disabled={v.inventory === 0}
                className={`rounded border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  selectedVariant.id === v.id
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

      {selectedVariant.sku && (
        <p className="text-xs text-gray-400">SKU: {selectedVariant.sku}</p>
      )}

      {/* Qty + add to cart */}
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
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            disabled={quantity >= maxQty}
            className="w-9 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>

        <Button size="lg" onClick={handleAddToCart} disabled={outOfStock} className="flex-1">
          {added ? '✓ Adăugat în coș' : outOfStock ? 'Stoc epuizat' : 'Adaugă în coș'}
        </Button>

        <Link href="/cart">
          <Button variant="secondary" size="lg">Coș</Button>
        </Link>
      </div>

      {product.vendor && (
        <p className="text-sm text-gray-400">Producător: {product.vendor}</p>
      )}
    </div>
  )
}
