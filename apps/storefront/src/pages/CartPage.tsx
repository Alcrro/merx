import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useStore } from '../hooks/useStore'
import { useStoreSlug } from '../contexts/StoreSlugContext'
import { CartItem } from '../components/molecules/CartItem'
import { Button } from '../components/atoms/Button'

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)
}

export function CartPage() {
  const storeSlug = useStoreSlug()
  const { data: store } = useStore(storeSlug)
  const { items, subtotal, clear } = useCart()
  const currency = store?.currency ?? 'EUR'

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some products to get started.</p>
        <Link to="/products">
          <Button>Browse products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your cart</h1>
        <button onClick={clear} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
          Clear all
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white px-6">
        {items.map((item) => (
          <CartItem key={item.variantId} item={item} currency={currency} />
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center justify-between text-lg font-semibold text-gray-900">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal, currency)}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">Shipping calculated at checkout.</p>
        <div className="mt-6 flex flex-col gap-3">
          <Link to="/checkout">
            <Button size="lg" className="w-full">
              Proceed to checkout
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="ghost" size="lg" className="w-full">
              Continue shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
