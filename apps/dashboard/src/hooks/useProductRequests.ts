import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productRequestApi } from '@merx/api-client'
import type { ProductRequestStatus, SubmitRequestInput, DuplicateCluster } from '@merx/api-client'

export const requestKeys = {
  all: ['product-requests'] as const,
  my: ['product-requests', 'my'] as const,
  adminList: (status?: ProductRequestStatus) => ['product-requests', 'admin', status] as const,
}

export function useMyRequests() {
  return useQuery({
    queryKey: requestKeys.my,
    queryFn: productRequestApi.getMyRequests,
  })
}

export function useSubmitRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SubmitRequestInput) => productRequestApi.submit(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: requestKeys.my }),
  })
}

export function useAdminRequests(status?: ProductRequestStatus) {
  return useQuery({
    queryKey: requestKeys.adminList(status),
    queryFn: () => productRequestApi.adminList(status),
  })
}

export function useApproveRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productRequestApi.adminApprove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: requestKeys.all }),
  })
}

export function useRejectRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason?: string }) =>
      productRequestApi.adminReject(id, rejectionReason),
    onSuccess: () => qc.invalidateQueries({ queryKey: requestKeys.all }),
  })
}

export function useRetryRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productRequestApi.adminRetry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: requestKeys.all }),
  })
}

export function useAnalyzeDuplicates() {
  return useMutation<DuplicateCluster[]>({
    mutationFn: () => productRequestApi.adminAnalyzeDuplicates(),
  })
}

export function useBulkRejectRequests() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, rejectionReason }: { ids: string[]; rejectionReason?: string }) =>
      productRequestApi.adminBulkReject(ids, rejectionReason),
    onSuccess: () => qc.invalidateQueries({ queryKey: requestKeys.all }),
  })
}
