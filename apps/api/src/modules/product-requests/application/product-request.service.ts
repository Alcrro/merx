import { prisma } from '../../../lib/prisma'
import type { IProductRequestRepository } from '../domain/ports'
import type { ProductRequestEntity } from '../domain/entities'
import { analyzeRequestDuplicates, type DuplicateCluster } from './deduplicate-requests.service'

export class ProductRequestError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'CONFLICT' | 'INVALID',
    public readonly meta?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ProductRequestError'
  }
}

export class ProductRequestService {
  constructor(private readonly repo: IProductRequestRepository) {}

  async submit(
    storeId: string,
    requestedTitle: string,
    description?: string | null,
    category?: string | null
  ): Promise<{ request: ProductRequestEntity; isDuplicate: boolean; existingRequestId?: string }> {
    const duplicate = await this.repo.findDuplicate(storeId, requestedTitle)
    if (duplicate) {
      return { request: duplicate, isDuplicate: true, existingRequestId: duplicate.id }
    }

    const request = await this.repo.create({ storeId, requestedTitle, description, category })
    return { request, isDuplicate: false }
  }

  async getMyRequests(storeId: string): Promise<ProductRequestEntity[]> {
    return this.repo.findByStoreId(storeId)
  }

  // Admin

  async adminListAll(status?: ProductRequestEntity['status']): Promise<ProductRequestEntity[]> {
    return this.repo.findAll({ status })
  }

  async adminApprove(id: string): Promise<ProductRequestEntity> {
    const request = await this.repo.findById(id)
    if (!request) throw new ProductRequestError('Request not found', 'NOT_FOUND')
    if (request.status !== 'admin_review') {
      throw new ProductRequestError('Only requests in admin_review can be approved', 'INVALID')
    }
    if (!request.catalogProductId) {
      throw new ProductRequestError('Request has no linked catalog product', 'INVALID')
    }
    await prisma.catalogProduct.update({
      where: { id: request.catalogProductId },
      data: { status: 'active' },
    })
    return this.repo.updateStatus(id, 'approved', { catalogProductId: request.catalogProductId })
  }

  async adminReject(id: string, rejectionReason?: string): Promise<ProductRequestEntity> {
    const request = await this.repo.findById(id)
    if (!request) throw new ProductRequestError('Request not found', 'NOT_FOUND')
    const rejectable = ['pending', 'ai_processing', 'admin_review'] as ProductRequestEntity['status'][]
    if (!rejectable.includes(request.status)) {
      throw new ProductRequestError('Request cannot be rejected in its current status', 'INVALID')
    }
    return this.repo.updateStatus(id, 'rejected', { rejectionReason })
  }

  async adminAnalyzeDuplicates(): Promise<DuplicateCluster[]> {
    const openStatuses = ['pending', 'ai_processing', 'admin_review'] as ProductRequestEntity['status'][]
    const all = await Promise.all(openStatuses.map((s) => this.repo.findAll({ status: s })))
    const requests = all.flat().map((r) => ({
      id: r.id,
      requestedTitle: r.requestedTitle,
      category: r.category,
    }))
    return analyzeRequestDuplicates(requests)
  }

  async adminBulkReject(ids: string[], rejectionReason?: string): Promise<number> {
    return this.repo.bulkUpdateStatus(ids, 'rejected', { rejectionReason })
  }

  async adminRetry(id: string): Promise<ProductRequestEntity> {
    const request = await this.repo.findById(id)
    if (!request) throw new ProductRequestError('Request not found', 'NOT_FOUND')
    const retryable = ['pending', 'ai_processing'] as ProductRequestEntity['status'][]
    if (!retryable.includes(request.status)) {
      throw new ProductRequestError('Only pending or stuck ai_processing requests can be retried', 'INVALID')
    }
    return this.repo.updateStatus(id, 'ai_processing')
  }

  // Called by BullMQ job after AI generation completes
  async markForAdminReview(id: string, catalogProductId: string): Promise<ProductRequestEntity> {
    return this.repo.updateStatus(id, 'admin_review', { catalogProductId })
  }

  async markAiProcessing(id: string): Promise<ProductRequestEntity> {
    return this.repo.updateStatus(id, 'ai_processing')
  }
}
