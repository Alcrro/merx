import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productApi } from '@merx/api-client'
import type { ListProductsParams, CreateProductInput } from '@merx/api-client'
import type { ProductAnalytics } from '@merx/types'

export const productKeys = {
  all: ['products'] as const,
  list: (params?: ListProductsParams) => ['products', 'list', params] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
  analytics: (id: string) => ['products', 'analytics', id] as const,
  categories: ['product-categories'] as const,
}

export function useProducts(params?: ListProductsParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productApi.list(params),
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApi.get(id),
    enabled: !!id,
  })
}

export function useProductAnalytics(id: string) {
  return useQuery<ProductAnalytics>({
    queryKey: productKeys.analytics(id),
    queryFn: () => productApi.getAnalytics(id),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductInput) => productApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  })
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CreateProductInput>) => productApi.update(id, data),
    onSuccess: (updated) => {
      qc.setQueryData(productKeys.detail(id), updated)
      void qc.invalidateQueries({ queryKey: productKeys.list() })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: productApi.listCategories,
  })
}

export function useCreateVariant(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof productApi.createVariant>[1]) =>
      productApi.createVariant(productId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.detail(productId) }),
  })
}

export function useUpdateVariant(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: Parameters<typeof productApi.updateVariant>[2] }) =>
      productApi.updateVariant(productId, variantId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.detail(productId) }),
  })
}

export function useDeleteVariant(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (variantId: string) => productApi.deleteVariant(productId, variantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.detail(productId) }),
  })
}

export function useUploadImage(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => productApi.uploadImage(productId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.detail(productId) }),
  })
}

export function useDeleteImage(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (imageId: string) => productApi.deleteImage(productId, imageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.detail(productId) }),
  })
}

export function useReorderImages(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => productApi.reorderImages(productId, ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.detail(productId) }),
  })
}
