import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

const StoreSlugContext = createContext<string>('')

export function StoreSlugProvider({ slug, children }: { slug: string; children: ReactNode }) {
  return <StoreSlugContext.Provider value={slug}>{children}</StoreSlugContext.Provider>
}

export function useStoreSlug(): string {
  return useContext(StoreSlugContext)
}
