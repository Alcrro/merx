export type ProductRequestStatus =
  | 'pending'
  | 'ai_processing'
  | 'admin_review'
  | 'approved'
  | 'rejected'

export interface ProductRequestEntity {
  id: string
  storeId: string
  requestedTitle: string
  description: string | null
  category: string | null
  status: ProductRequestStatus
  rejectionReason: string | null
  catalogProductId: string | null
  createdAt: Date
  updatedAt: Date
  duplicateCount?: number
}
