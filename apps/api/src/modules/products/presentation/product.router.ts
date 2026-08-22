import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { authenticate, withAuth } from '../../../middleware/authenticate'
import { uploadSingle } from '../../../middleware/upload.middleware'
import { productController } from './product.controller'

const router = Router()
router.use(authenticate)

router.get('/', withAuth(productController.list))
router.post('/', withAuth(productController.create))
router.get('/:id/analytics', withAuth(productController.getAnalytics))
router.get('/:id', withAuth(productController.get))
router.put('/:id', withAuth(productController.update))
router.delete('/:id', withAuth(productController.delete))

router.post('/:id/variants', withAuth(productController.createVariant))
router.put('/:id/variants/:variantId', withAuth(productController.updateVariant))
router.delete('/:id/variants/:variantId', withAuth(productController.deleteVariant))

router.post(
  '/:id/images',
  (req: Request, res: Response, next: NextFunction) => {
    uploadSingle(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message })
        return
      }
      next()
    })
  },
  withAuth(productController.uploadImage),
)
router.delete('/:id/images/:imageId', withAuth(productController.deleteImage))
router.patch('/:id/images/reorder', withAuth(productController.reorderImages))

export { router as productRouter }

export const categoryRouter = Router()
categoryRouter.use(authenticate)
categoryRouter.get('/', withAuth(productController.listCategories))
categoryRouter.post('/', withAuth(productController.createCategory))
