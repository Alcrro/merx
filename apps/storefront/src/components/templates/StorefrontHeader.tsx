'use client'

import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useStore } from '@/contexts/StoreContext'

export function StorefrontHeader() {
  const { store } = useStore()
  const { count } = useCart()

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-lg text-gray-900 hover:text-gray-600 transition-colors"
        >
          {store?.name ?? '—'}
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/products" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Produse
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Coș
            {count > 0 && (
              <span className="absolute -top-2 -right-4 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}
