'use client'

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { PublicStore } from '@/lib/api'

interface StoreContextValue {
  store: PublicStore | null
  slug: string
}

const StoreContext = createContext<StoreContextValue>({ store: null, slug: '' })

export function StoreProvider({
  store,
  slug,
  children,
}: {
  store: PublicStore | null
  slug: string
  children: ReactNode
}) {
  return <StoreContext.Provider value={{ store, slug }}>{children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}
