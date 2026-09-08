import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { catalogApi, adminCatalogApi, archiveCriteriaApi } from '@merx/api-client'
import type { SearchCatalogParams, AdminSearchCatalogParams } from '@merx/api-client'

export const catalogKeys = {
  all: ['catalog'] as const,
  search: (params?: SearchCatalogParams) => ['catalog', 'search', params] as const,
  detail: (id: string) => ['catalog', 'detail', id] as const,
  categories: ['catalog', 'categories'] as const,
  myProducts: ['catalog', 'my'] as const,
  myProduct: (id: string) => ['catalog', 'my', id] as const,
}

export function useSearchCatalog(params?: SearchCatalogParams) {
  return useQuery({
    queryKey: catalogKeys.search(params),
    queryFn: () => catalogApi.search(params),
  })
}

export function useCatalogProduct(id: string) {
  return useQuery({
    queryKey: catalogKeys.detail(id),
    queryFn: () => catalogApi.getById(id),
    enabled: !!id,
  })
}

export function useCatalogCategories() {
  return useQuery({
    queryKey: catalogKeys.categories,
    queryFn: catalogApi.getCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export function useMyStoreProducts() {
  return useQuery({
    queryKey: catalogKeys.myProducts,
    queryFn: catalogApi.getMyStoreProducts,
  })
}

export function useStoreProduct(storeProductId: string) {
  return useQuery({
    queryKey: catalogKeys.myProduct(storeProductId),
    queryFn: () => catalogApi.getStoreProduct(storeProductId),
    enabled: !!storeProductId,
  })
}

export function useUpdateStoreProduct(storeProductId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { shippingCost?: number }) => catalogApi.updateStoreProduct(storeProductId, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: catalogKeys.myProduct(storeProductId) }) },
  })
}

export function useStoreProductAnalytics(storeProductId: string) {
  return useQuery({
    queryKey: [...catalogKeys.myProduct(storeProductId), 'analytics'],
    queryFn: () => catalogApi.getStoreProductAnalytics(storeProductId),
    enabled: !!storeProductId,
  })
}

export function useStoreProductVariantAnalytics(storeProductId: string, catalogVariantId: string) {
  return useQuery({
    queryKey: [...catalogKeys.myProduct(storeProductId), 'variants', catalogVariantId, 'analytics'],
    queryFn: () => catalogApi.getStoreProductVariantAnalytics(storeProductId, catalogVariantId),
    enabled: !!storeProductId && !!catalogVariantId,
  })
}

export function useAddToStore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ catalogProductId, variantIds }: { catalogProductId: string; variantIds: string[] }) =>
      catalogApi.addToStore(catalogProductId, variantIds),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: catalogKeys.myProducts })
      void qc.invalidateQueries({ queryKey: catalogKeys.search() })
    },
  })
}

export function useUpdateVariantPrice(storeProductId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ catalogVariantId, customPrice }: { catalogVariantId: string; customPrice: number | null }) =>
      catalogApi.updateVariantPrice(storeProductId, catalogVariantId, customPrice),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: catalogKeys.myProduct(storeProductId) })
    },
  })
}

export function useAddVariantToStore(storeProductId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (catalogVariantId: string) => catalogApi.addVariantToStore(storeProductId, catalogVariantId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: catalogKeys.myProduct(storeProductId) })
    },
  })
}

export function useRemoveVariantFromStore(storeProductId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (catalogVariantId: string) => catalogApi.removeVariantFromStore(storeProductId, catalogVariantId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: catalogKeys.myProduct(storeProductId) })
    },
  })
}

// Admin hooks
export const adminCatalogKeys = {
  search: (params?: AdminSearchCatalogParams) => ['admin-catalog', 'search', params] as const,
  archiveCriteria: ['admin-catalog', 'archive-criteria'] as const,
}

export function useAdminSearchCatalog(params?: AdminSearchCatalogParams) {
  return useQuery({
    queryKey: adminCatalogKeys.search(params),
    queryFn: () => adminCatalogApi.search(params),
  })
}

export function useAdminArchiveCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminCatalogApi.archive(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-catalog'] })
      void qc.invalidateQueries({ queryKey: catalogKeys.search() })
    },
  })
}

export function useAdminAddVariant(catalogProductId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; sku: string; suggestedPrice: number }) =>
      adminCatalogApi.addVariant(catalogProductId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-catalog'] })
    },
  })
}

export function useAdminGenerateVariants(catalogProductId: string) {
  return useMutation({
    mutationFn: (hint: string) => adminCatalogApi.generateVariants(catalogProductId, hint),
  })
}

export function useAdminAddVariantsBulk(catalogProductId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (variants: { title: string; sku: string; suggestedPrice: number }[]) =>
      Promise.all(variants.map((v) => adminCatalogApi.addVariant(catalogProductId, v))),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-catalog'] })
    },
  })
}

export function useAdminActivateCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminCatalogApi.update(id, { status: 'active' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-catalog'] })
      void qc.invalidateQueries({ queryKey: catalogKeys.search() })
    },
  })
}

export function useArchiveCriteria() {
  return useQuery({
    queryKey: adminCatalogKeys.archiveCriteria,
    queryFn: archiveCriteriaApi.list,
  })
}

export function useCreateArchiveCriteria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: archiveCriteriaApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminCatalogKeys.archiveCriteria }),
  })
}

export function useDeleteArchiveCriteria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: archiveCriteriaApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminCatalogKeys.archiveCriteria }),
  })
}

export function useRunArchiveCriteria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: archiveCriteriaApi.run,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-catalog'] })
    },
  })
}

export function useAdminUploadVariantImage(catalogProductId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ variantId, file }: { variantId: string; file: File }) =>
      adminCatalogApi.uploadVariantImage(catalogProductId, variantId, file),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-catalog'] })
    },
  })
}

export function useAdminDeleteVariantImage(catalogProductId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ variantId, imageId }: { variantId: string; imageId: string }) =>
      adminCatalogApi.deleteVariantImage(catalogProductId, variantId, imageId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-catalog'] })
    },
  })
}
