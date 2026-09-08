import { apiClient } from './client'

export type ProductRequestStatus =
  | 'pending'
  | 'ai_processing'
  | 'admin_review'
  | 'approved'
  | 'rejected'

export interface ProductRequest {
  id: string
  storeId: string
  requestedTitle: string
  description: string | null
  category: string | null
  status: ProductRequestStatus
  rejectionReason: string | null
  catalogProductId: string | null
  createdAt: string
  updatedAt: string
  duplicateCount?: number
}

export interface SubmitRequestInput {
  requestedTitle: string
  category?: string | null
  description?: string | null
}

export interface DuplicateCluster {
  canonical: { id: string; title: string }
  duplicates: { id: string; title: string }[]
}

export const productRequestApi = {
  submit: (data: SubmitRequestInput): Promise<ProductRequest> =>
    apiClient.post('/product-requests', data).then((r) => r.data),

  getMyRequests: (): Promise<ProductRequest[]> =>
    apiClient.get('/product-requests/my').then((r) => r.data),

  adminList: (status?: ProductRequestStatus): Promise<ProductRequest[]> =>
    apiClient.get('/admin/product-requests', { params: { status } }).then((r) => r.data),

  adminApprove: (id: string): Promise<ProductRequest> =>
    apiClient.patch(`/admin/product-requests/${id}/approve`).then((r) => r.data),

  adminReject: (id: string, rejectionReason?: string): Promise<ProductRequest> =>
    apiClient.patch(`/admin/product-requests/${id}/reject`, { rejectionReason }).then((r) => r.data),

  adminRetry: (id: string): Promise<ProductRequest> =>
    apiClient.post(`/admin/product-requests/${id}/retry`).then((r) => r.data),

  adminAnalyzeDuplicates: (): Promise<DuplicateCluster[]> =>
    apiClient.post('/admin/product-requests/analyze-duplicates').then((r) => r.data),

  adminBulkReject: (ids: string[], rejectionReason?: string): Promise<{ rejected: number }> =>
    apiClient.post('/admin/product-requests/bulk-reject', { ids, rejectionReason }).then((r) => r.data),
}
