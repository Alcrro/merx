import type { Response, NextFunction } from 'express'
import type { AuthenticatedStoreRequest as AuthenticatedRequest } from '../../../middleware/authenticate'
import { ProductRequestService, ProductRequestError } from '../application/product-request.service'
import { productRequestRepository } from '../infrastructure/product-request.repository'
import { enqueueGenerateJob } from '../infrastructure/generate-catalog-product.job'
import {
  submitRequestSchema,
  rejectRequestSchema,
  listAdminRequestsSchema,
} from './product-request.schema'

const service = new ProductRequestService(productRequestRepository)

function handleError(err: unknown, res: Response): boolean {
  if (err instanceof ProductRequestError) {
    const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'CONFLICT' ? 409 : 400
    res.status(status).json({ error: err.message, meta: err.meta })
    return true
  }
  return false
}

export const productRequestController = {
  submit: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { requestedTitle, category, description } = submitRequestSchema.parse(req.body)
      const { request, isDuplicate, existingRequestId } = await service.submit(
        req.user.storeId,
        requestedTitle,
        description,
        category
      )

      if (isDuplicate) {
        res.status(409).json({
          error: 'A request for this product already exists',
          existingRequestId,
          request,
        })
        return
      }

      try {
        await enqueueGenerateJob(request.id)
        await service.markAiProcessing(request.id)
        res.status(201).json({ ...request, status: 'ai_processing' })
      } catch (err) {
        console.error('[product-request] Failed to enqueue generate job:', err)
        res.status(201).json(request)
      }
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  getMyRequests: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const requests = await service.getMyRequests(req.user.storeId)
      res.json(requests)
    } catch (err) {
      next(err)
    }
  },

  // Admin

  adminList: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { status } = listAdminRequestsSchema.parse(req.query)
      const requests = await service.adminListAll(status)
      res.json(requests)
    } catch (err) {
      next(err)
    }
  },

  adminApprove: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const request = await service.adminApprove(req.params.id)
      res.json(request)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  adminReject: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { rejectionReason } = rejectRequestSchema.parse(req.body)
      const request = await service.adminReject(req.params.id, rejectionReason)
      res.json(request)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  adminAnalyzeDuplicates: async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const clusters = await service.adminAnalyzeDuplicates()
      res.json(clusters)
    } catch (err) {
      next(err)
    }
  },

  adminBulkReject: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { ids, rejectionReason } = req.body as { ids: string[]; rejectionReason?: string }
      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ error: 'ids must be a non-empty array' })
        return
      }
      const count = await service.adminBulkReject(ids, rejectionReason)
      res.json({ rejected: count })
    } catch (err) {
      next(err)
    }
  },

  adminRetry: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const request = await service.adminRetry(req.params.id)
      await enqueueGenerateJob(req.params.id)
      res.json(request)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },
}
