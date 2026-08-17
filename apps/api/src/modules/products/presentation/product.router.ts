import { Router } from 'express'
import { authenticate, withAuth } from '../../../middleware/authenticate'
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

export { router as productRouter }

export const categoryRouter = Router()
categoryRouter.use(authenticate)
categoryRouter.get('/', withAuth(productController.listCategories))
categoryRouter.post('/', withAuth(productController.createCategory))
