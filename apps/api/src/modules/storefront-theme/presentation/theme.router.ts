import { Router } from 'express'
import { authenticate, withAuth } from '../../../middleware/authenticate'
import { themeController } from './theme.controller'

export const themeRouter = Router()

themeRouter.use(authenticate)

themeRouter.get('/', withAuth(themeController.getSummary))
themeRouter.post('/draft', withAuth(themeController.createDraft))
themeRouter.patch('/draft', withAuth(themeController.applyPatch))
themeRouter.post('/publish', withAuth(themeController.publish))
themeRouter.post('/rollback/:versionId', withAuth(themeController.rollback))
