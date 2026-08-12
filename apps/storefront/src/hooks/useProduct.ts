import { useQuery } from '@tanstack/react-query'
import { storefrontApi } from '../lib/api'

export function useProduct(slug: string, productId: string) {
  return useQuery({
    queryKey: ['product', slug, productId],
    queryFn: () => storefrontApi.getProduct(slug, productId),
    enabled: Boolean(slug && productId),
  })
}
