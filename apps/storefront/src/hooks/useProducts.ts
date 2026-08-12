import { useQuery } from '@tanstack/react-query'
import { storefrontApi } from '../lib/api'

interface UseProductsParams {
  slug: string
  page?: number
  limit?: number
  categoryId?: string
}

export function useProducts({ slug, page = 1, limit = 20, categoryId }: UseProductsParams) {
  return useQuery({
    queryKey: ['products', slug, page, limit, categoryId],
    queryFn: () => storefrontApi.listProducts(slug, { page, limit, categoryId }),
  })
}

export function useCategories(slug: string) {
  return useQuery({
    queryKey: ['categories', slug],
    queryFn: () => storefrontApi.listCategories(slug),
    staleTime: 5 * 60 * 1000,
  })
}
