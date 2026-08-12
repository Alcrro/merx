import { useCart } from '../../contexts/CartContext'
import type { CartItem as CartItemType } from '../../contexts/CartContext'

interface CartItemProps {
  item: CartItemType
  currency: string
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)
}

export function CartItem({ item, currency }: CartItemProps) {
  const { updateQty, removeItem } = useCart()

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center shrink-0">
        <span className="text-2xl text-gray-300">📦</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.productTitle}</p>
        {item.variantTitle !== 'Default' && (
          <p className="text-sm text-gray-500">{item.variantTitle}</p>
        )}
        <p className="text-sm text-gray-500">{formatPrice(item.price, currency)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => updateQty(item.variantId, item.quantity - 1)}
          className="h-8 w-8 rounded border border-gray-300 hover:bg-gray-50 flex items-center justify-center text-lg leading-none"
        >
          −
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQty(item.variantId, item.quantity + 1)}
          className="h-8 w-8 rounded border border-gray-300 hover:bg-gray-50 flex items-center justify-center text-lg leading-none"
        >
          +
        </button>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-semibold">{formatPrice(item.price * item.quantity, currency)}</p>
        <button
          onClick={() => removeItem(item.variantId)}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
