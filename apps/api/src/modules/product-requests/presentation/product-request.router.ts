import { Router } from 'express'
import { authenticate, withAuth } from '../../../middleware/authenticate'
import { requireAdmin } from '../../../middleware/requireAdmin'
import { productRequestController } from './product-request.controller'

export const productRequestRouter = Router()
productRequestRouter.use(authenticate)

productRequestRouter.post('/', withAuth(productRequestController.submit))
productRequestRouter.get('/my', withAuth(productRequestController.getMyRequests))

export const adminProductRequestRouter = Router()
adminProductRequestRouter.use(authenticate, requireAdmin)

adminProductRequestRouter.get('/', withAuth(productRequestController.adminList))
adminProductRequestRouter.post('/analyze-duplicates', withAuth(productRequestController.adminAnalyzeDuplicates))
adminProductRequestRouter.post('/bulk-reject', withAuth(productRequestController.adminBulkReject))
adminProductRequestRouter.patch('/:id/approve', withAuth(productRequestController.adminApprove))
adminProductRequestRouter.patch('/:id/reject', withAuth(productRequestController.adminReject))
adminProductRequestRouter.post('/:id/retry', withAuth(productRequestController.adminRetry))
