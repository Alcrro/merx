import { Link, Outlet } from 'react-router-dom'
import { useStore } from '../../hooks/useStore'
import { useCart } from '../../contexts/CartContext'
import { useStoreSlug } from '../../contexts/StoreSlugContext'

export function StorefrontLayout() {
  const storeSlug = useStoreSlug()
  const { data: store } = useStore(storeSlug)
  const { count } = useCart()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link to="/" className="font-semibold text-lg text-gray-900 hover:text-gray-600">
            {store?.name ?? '—'}
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900">
              Products
            </Link>
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              <span>Cart</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        {store?.name} · Powered by Merx
      </footer>
    </div>
  )
}
