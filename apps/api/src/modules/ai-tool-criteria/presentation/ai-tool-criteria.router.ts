import { Router } from 'express'
import { authenticate, withAuth } from '../../../middleware/authenticate'
import { requireAdmin } from '../../../middleware/requireAdmin'
import { aiToolCriteriaController } from './ai-tool-criteria.controller'

export const aiToolCriteriaRouter = Router()
aiToolCriteriaRouter.use(authenticate, requireAdmin)

aiToolCriteriaRouter.get('/:toolName/criteria', withAuth(aiToolCriteriaController.list))
aiToolCriteriaRouter.post('/:toolName/criteria', withAuth(aiToolCriteriaController.add))
aiToolCriteriaRouter.delete('/:toolName/criteria/:id', withAuth(aiToolCriteriaController.remove))
