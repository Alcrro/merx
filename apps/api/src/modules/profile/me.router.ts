import { Router } from 'express'
import multer from 'multer'
import { authenticate, withAuth } from '../../middleware/authenticate'
import { requestDataExport } from './presentation/controllers/export.controller'
import { uploadAvatar, deleteAvatar } from './presentation/controllers/avatar.controller'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024 } })

const router = Router()

router.post('/export', authenticate, withAuth(requestDataExport))
router.post('/avatar', authenticate, upload.single('avatar'), withAuth(uploadAvatar))
router.delete('/avatar', authenticate, withAuth(deleteAvatar))

export { router as meRouter }
