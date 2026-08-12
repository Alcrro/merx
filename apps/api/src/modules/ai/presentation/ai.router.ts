import { Router } from 'express'
import { authenticate, withAuth } from '../../../middleware/authenticate'
import { aiController } from './ai.controller'

const router = Router()
router.use(authenticate)

router.post('/', withAuth(aiController.createSession))
router.get('/', withAuth(aiController.listSessions))
router.get('/insights', withAuth(aiController.listInsights))
router.get('/insights/history', withAuth(aiController.listInsightsHistory))
router.post('/insights/run', withAuth(aiController.runInsights))
router.post('/insights/:insightId/restock', withAuth(aiController.restockInsight))
router.get('/:id', withAuth(aiController.getSession))
router.delete('/:id', withAuth(aiController.deleteSession))
router.post('/:id/chat', withAuth(aiController.chat))
router.post('/:id/stream', withAuth(aiController.stream))

export { router as aiRouter }
