import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../../middleware/authenticate'
import { CatalogService, CatalogError } from '../application/catalog.service'
import { catalogRepository } from '../infrastructure/catalog.repository'
import { getStoreProductAnalytics } from '../application/store-product-analytics.service'
import { getStoreProductVariantAnalytics } from '../application/store-product-variant-analytics.service'
import { enqueueModerationJob } from '../infrastructure/moderate-content.job'
import { classifyVariant } from '../application/variant-classifier.service'
import { generateVariants } from '../application/generate-variants.service'
import {
  searchCatalogSchema,
  createCatalogProductSchema,
  updateCatalogProductSchema,
  addVariantSchema,
  updateVariantPriceSchema,
  updateStoreProductSchema,
  archiveCriteriaSchema,
  updateArchiveCriteriaSchema,
} from './catalog.schema'
import {
  listArchiveCriteria,
  createArchiveCriteria,
  updateArchiveCriteria,
  deleteArchiveCriteria,
  ArchiveCriteriaError,
} from '../application/archive-criteria.service'
import { CatalogVariantImageService, CatalogVariantImageError } from '../application/catalog-variant-image.service'
import { CatalogVariantImageRepository } from '../infrastructure/catalog-variant-image.repository'
import { storageProvider } from '../../../lib/storage'
import { config } from '../../../config'

const service = new CatalogService(catalogRepository)
const variantImageService = new CatalogVariantImageService(
  new CatalogVariantImageRepository(),
  storageProvider,
  config.storage.publicUrl,
)

function handleError(err: unknown, res: Response): boolean {
  if (err instanceof CatalogError) {
    const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'CONFLICT' ? 409 : 400
    res.status(status).json({ error: err.message })
    return true
  }
  if (err instanceof ArchiveCriteriaError) {
    const status = err.code === 'NOT_FOUND' ? 404 : 409
    res.status(status).json({ error: err.message })
    return true
  }
  if (err instanceof CatalogVariantImageError) {
    const status = err.code === 'NOT_FOUND' ? 404 : 400
    res.status(status).json({ error: err.message })
    return true
  }
  return false
}

// ─── Store owner ─────────────────────────────────────────────────────────────

export const catalogController = {
  search: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const params = searchCatalogSchema.parse(req.query)
      const result = await service.search(params)
      res.json(result)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const product = await service.getById(req.params.id)
      res.json(product)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  addToStore: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const variantIds: string[] = Array.isArray(req.body?.variantIds) ? req.body.variantIds : []
      const storeProduct = await service.addToStore(req.user.storeId, req.params.catalogProductId, variantIds)
      res.status(201).json(storeProduct)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  getMyStoreProducts: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const products = await service.getStoreProducts(req.user.storeId)
      res.json(products)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  getStoreProduct: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const product = await service.getStoreProduct(req.params.storeProductId, req.user.storeId)
      res.json(product)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  updateStoreProduct: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = updateStoreProductSchema.parse(req.body)
      const product = await service.updateStoreProduct(req.params.storeProductId, req.user.storeId, data)
      res.json(product)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  updateVariantPrice: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { customPrice } = updateVariantPriceSchema.parse(req.body)
      const variant = await service.updateVariantPrice(
        req.params.storeProductId,
        req.user.storeId,
        req.params.catalogVariantId,
        customPrice
      )
      res.json(variant)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  getStoreProductAnalytics: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const analytics = await getStoreProductAnalytics(req.params.storeProductId, req.user.storeId)
      res.json(analytics)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  addVariantToStore: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const variant = await service.addVariantToStore(req.params.storeProductId, req.params.catalogVariantId, req.user.storeId)
      res.status(201).json(variant)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  removeVariantFromStore: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await service.removeVariantFromStore(req.params.storeProductId, req.params.catalogVariantId, req.user.storeId)
      res.status(204).send()
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  getStoreProductVariantAnalytics: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const analytics = await getStoreProductVariantAnalytics(
        req.params.storeProductId,
        req.params.catalogVariantId,
        req.user.storeId
      )
      res.json(analytics)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  listCategories: async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const categories = await service.listCategories()
      res.json(categories)
    } catch (err) {
      next(err)
    }
  },

  addVariantWithClassify: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = addVariantSchema.parse(req.body)
      const product = await service.getById(req.params.catalogProductId)

      const classification = await classifyVariant(data.title, product.title)

      if (classification.type === 'new_product' && classification.confidence === 'high') {
        res.status(422).json({
          classification: 'new_product',
          confidence: classification.confidence,
          reason: classification.reason,
          suggestion: 'Consider submitting a new product request instead',
        })
        return
      }

      const variant = await service.adminAddVariant(req.params.catalogProductId, data)

      res.status(201).json({
        variant,
        classification: classification.type,
        confidence: classification.confidence,
        ...(classification.confidence === 'low' && {
          warning: 'Classification confidence is low — admin will review',
        }),
      })
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminCatalogController = {
  search: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const params = searchCatalogSchema.parse(req.query)
      const result = await service.adminSearch(params)
      res.json(result)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = createCatalogProductSchema.parse(req.body)
      const product = await service.adminCreate(data)
      if (product.status === 'pending') {
        await enqueueModerationJob(product.id)
      }
      res.status(201).json(product)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  update: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = updateCatalogProductSchema.parse(req.body)
      const product = await service.adminUpdate(req.params.id, data)
      // Re-moderate on title/description change
      if (data.title !== undefined || data.description !== undefined) {
        await enqueueModerationJob(product.id)
      }
      res.json(product)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  archive: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const product = await service.adminArchive(req.params.id)
      res.json(product)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  addVariant: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = addVariantSchema.parse(req.body)
      const variant = await service.adminAddVariant(req.params.id, data)
      res.status(201).json(variant)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  generateVariants: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { hint } = req.body as { hint?: string }
      if (!hint?.trim()) {
        res.status(400).json({ error: 'hint is required' })
        return
      }
      const product = await service.getById(req.params.id)
      if (product.status !== 'active') {
        res.status(400).json({ error: 'Variants can only be generated for active products' })
        return
      }
      const suggestions = await generateVariants(
        product.title,
        (product.variants ?? []).map((v) => ({
          title: v.title,
          sku: v.sku,
          suggestedPrice: v.suggestedPrice,
        })),
        hint.trim()
      )
      res.json(suggestions)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  // Archive criteria management
  listArchiveCriteria: async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const criteria = await listArchiveCriteria()
      res.json(criteria)
    } catch (err) {
      next(err)
    }
  },

  createArchiveCriteria: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = archiveCriteriaSchema.parse(req.body)
      const criteria = await createArchiveCriteria(data)
      res.status(201).json(criteria)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  updateArchiveCriteria: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = updateArchiveCriteriaSchema.parse(req.body)
      const criteria = await updateArchiveCriteria(req.params.id, data)
      res.json(criteria)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  deleteArchiveCriteria: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await deleteArchiveCriteria(req.params.id)
      res.status(204).send()
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  uploadVariantImage: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' })
        return
      }
      const image = await variantImageService.uploadImage(req.params.id, req.params.variantId, req.file)
      res.status(201).json(image)
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },

  deleteVariantImage: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await variantImageService.deleteImage(req.params.id, req.params.variantId, req.params.imageId)
      res.status(204).send()
    } catch (err) {
      if (!handleError(err, res)) next(err)
    }
  },
}
