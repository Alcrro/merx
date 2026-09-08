import type { ProductRequestEntity, ProductRequestStatus } from './entities'

export interface IProductRequestRepository {
  findById(id: string): Promise<ProductRequestEntity | null>
  findByStoreId(storeId: string): Promise<ProductRequestEntity[]>
  findDuplicate(storeId: string, requestedTitle: string): Promise<ProductRequestEntity | null>
  findAll(filters: ListRequestsFilter): Promise<ProductRequestEntity[]>
  countByTitle(requestedTitle: string): Promise<number>
  create(data: CreateProductRequestData): Promise<ProductRequestEntity>
  updateStatus(id: string, status: ProductRequestStatus, extra?: UpdateStatusExtra): Promise<ProductRequestEntity>
  bulkUpdateStatus(ids: string[], status: ProductRequestStatus, extra?: UpdateStatusExtra): Promise<number>
}

export interface CreateProductRequestData {
  storeId: string
  requestedTitle: string
  description?: string | null
  category?: string | null
}

export interface UpdateStatusExtra {
  rejectionReason?: string
  catalogProductId?: string
}

export interface ListRequestsFilter {
  status?: ProductRequestStatus
}
