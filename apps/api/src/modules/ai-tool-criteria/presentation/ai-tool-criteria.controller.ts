import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../../middleware/authenticate'
import { getActiveByTool, addFollowUp, softDeleteFollowUp, AIToolCriteriaError } from '../application/ai-tool-criteria.service'
import { addFollowUpSchema, toolNameParamSchema } from './ai-tool-criteria.schema'

export const aiToolCriteriaController = {
  list: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { toolName } = toolNameParamSchema.parse(req.params)
      const criteria = await getActiveByTool(toolName)
      res.json(criteria)
    } catch (err) {
      next(err)
    }
  },

  add: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { toolName } = toolNameParamSchema.parse(req.params)
      const { followUpText } = addFollowUpSchema.parse(req.body)
      const criteria = await addFollowUp(toolName, followUpText, req.user.userId)
      res.status(201).json(criteria)
    } catch (err) {
      next(err)
    }
  },

  remove: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await softDeleteFollowUp(req.params.id)
      res.status(204).send()
    } catch (err) {
      if (err instanceof AIToolCriteriaError && err.code === 'NOT_FOUND') {
        res.status(404).json({ error: err.message })
        return
      }
      next(err)
    }
  },
}
