import { Router } from 'express'
import { authenticate, withAuth } from '../../middleware/authenticate'
import { requireAdmin } from '../../middleware/requireAdmin'
import { uploadSingle } from '../../middleware/upload.middleware'
import { createCatalogContainer } from './container'
import { createCatalogController } from './presentation/controllers/catalog.controller'
import { createAdminCatalogController } from './presentation/controllers/admin-catalog.controller'

const container = createCatalogContainer()
const catalogController = createCatalogController(container)
const adminCatalogController = createAdminCatalogController(container)

// ─── Store owner routes ───────────────────────────────────────────────────────

export const catalogRouter = Router()
catalogRouter.use(authenticate)

catalogRouter.get('/', withAuth(catalogController.search))
catalogRouter.get('/categories', withAuth(catalogController.listCategories))
catalogRouter.get('/my', withAuth(catalogController.getMyStoreProducts))
catalogRouter.get('/my/:storeProductId/analytics', withAuth(catalogController.getStoreProductAnalytics))
catalogRouter.get('/my/:storeProductId/variants/:catalogVariantId/analytics', withAuth(catalogController.getStoreProductVariantAnalytics))
catalogRouter.post('/my/:storeProductId/variants/:catalogVariantId', withAuth(catalogController.addVariantToStore))
catalogRouter.delete('/my/:storeProductId/variants/:catalogVariantId', withAuth(catalogController.removeVariantFromStore))
catalogRouter.patch('/my/:storeProductId/variants/:catalogVariantId/price', withAuth(catalogController.updateVariantPrice))
catalogRouter.patch('/my/:storeProductId', withAuth(catalogController.updateStoreProduct))
catalogRouter.get('/my/:storeProductId', withAuth(catalogController.getStoreProduct))
catalogRouter.get('/:id', withAuth(catalogController.getById))
catalogRouter.post('/:catalogProductId/add-to-store', withAuth(catalogController.addToStore))
catalogRouter.post('/:catalogProductId/variants', withAuth(catalogController.addVariantWithClassify))

// ─── Admin routes ─────────────────────────────────────────────────────────────

export const adminCatalogRouter = Router()
adminCatalogRouter.use(authenticate, requireAdmin)

adminCatalogRouter.get('/', withAuth(adminCatalogController.search))
adminCatalogRouter.post('/', withAuth(adminCatalogController.create))
adminCatalogRouter.patch('/:id', withAuth(adminCatalogController.update))
adminCatalogRouter.delete('/:id', withAuth(adminCatalogController.archive))
adminCatalogRouter.post('/:id/variants', withAuth(adminCatalogController.addVariant))
adminCatalogRouter.post('/:id/generate-variants', withAuth(adminCatalogController.generateVariants))

adminCatalogRouter.get('/archive-criteria', withAuth(adminCatalogController.listArchiveCriteria))
adminCatalogRouter.post('/archive-criteria', withAuth(adminCatalogController.createArchiveCriteria))
adminCatalogRouter.patch('/archive-criteria/:id', withAuth(adminCatalogController.updateArchiveCriteria))
adminCatalogRouter.delete('/archive-criteria/:id', withAuth(adminCatalogController.deleteArchiveCriteria))

adminCatalogRouter.post(
  '/:id/variants/:variantId/images',
  (req, res, next) => {
    uploadSingle(req, res, (err: unknown) => {
      if (err instanceof Error) { res.status(400).json({ error: err.message }); return }
      next()
    })
  },
  withAuth(adminCatalogController.uploadVariantImage),
)
adminCatalogRouter.delete('/:id/variants/:variantId/images/:imageId', withAuth(adminCatalogController.deleteVariantImage))
