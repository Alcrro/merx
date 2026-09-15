'use client'

import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/api'
import type { CartItem as CartItemType } from '@/contexts/CartContext'

export function CartItem({ item, currency }: { item: CartItemType; currency: string }) {
  const { updateQty, removeItem } = useCart()

  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="h-16 w-16 shrink-0 rounded bg-gray-100 flex items-center justify-center text-2xl text-gray-300">
        📦
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.productTitle}</p>
        {item.variantTitle !== 'Default' && (
          <p className="text-xs text-gray-500 mt-0.5">{item.variantTitle}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded overflow-hidden">
            <button
              onClick={() => updateQty(item.variantId, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-sm"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => updateQty(item.variantId, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-sm"
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeItem(item.variantId)}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Elimină
          </button>
        </div>
      </div>

      <div className="text-sm font-semibold text-gray-900 shrink-0">
        {formatPrice(item.price * item.quantity, currency)}
      </div>
    </div>
  )
}
