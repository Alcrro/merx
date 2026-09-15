'use client'

import { StoreProvider } from '@/contexts/StoreContext'
import { CartProvider } from '@/contexts/CartContext'
import type { PublicStore } from '@/lib/api'

export function Providers({
  store,
  slug,
  children,
}: {
  store: PublicStore | null
  slug: string
  children: React.ReactNode
}) {
  return (
    <StoreProvider store={store} slug={slug}>
      <CartProvider slug={slug}>{children}</CartProvider>
    </StoreProvider>
  )
}
