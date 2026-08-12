import { useQuery } from '@tanstack/react-query'
import { storefrontApi } from '../lib/api'

export function useStore(slug: string) {
  return useQuery({
    queryKey: ['store', slug],
    queryFn: () => storefrontApi.getStore(slug),
    staleTime: 5 * 60 * 1000,
  })
}
