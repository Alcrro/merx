import type { Response, NextFunction } from 'express'
import type { AuthenticatedRequest } from '../../../../middleware/authenticate'
import type { CatalogProductQuery } from '../../application/queries/catalog-product.query'
import type { CatalogProductService } from '../../application/services/catalog-product.service'
import type { GenerateVariantsService } from '../../application/services/generate-variants.service'
import type { ArchiveCriteriaService } from '../../application/services/archive-criteria.service'
import type { CatalogVariantImageService } from '../../application/services/catalog-variant-image.service'
import {
  searchCatalogSchema,
  createCatalogProductSchema,
  updateCatalogProductSchema,
  addVariantSchema,
  archiveCriteriaSchema,
  updateArchiveCriteriaSchema,
} from '../validators/catalog.validator'
import { handleCatalogError } from '../errors/catalog.errors'
import {
  toCatalogProductDto,
  toPaginatedCatalogProductsDto,
  toCatalogVariantDto,
  toCatalogVariantImageDto,
  toArchiveCriteriaDto,
} from '../mappers/catalog.mapper'

export interface AdminCatalogControllerDeps {
  catalogProductQuery: CatalogProductQuery
  catalogProductService: CatalogProductService
  generateVariantsService: GenerateVariantsService
  archiveCriteriaService: ArchiveCriteriaService
  variantImageService: CatalogVariantImageService
  notifyModeration: (productId: string) => Promise<void>
}

export function createAdminCatalogController(deps: AdminCatalogControllerDeps) {
  const { catalogProductQuery, catalogProductService, generateVariantsService, archiveCriteriaService, variantImageService, notifyModeration } = deps

  return {
    search: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const params = searchCatalogSchema.parse(req.query)
        res.json(toPaginatedCatalogProductsDto(await catalogProductQuery.adminSearch(params)))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const data = createCatalogProductSchema.parse(req.body)
        const product = await catalogProductService.adminCreate(data)
        if (product.status === 'pending') {
          await notifyModeration(product.id)
        }
        res.status(201).json(toCatalogProductDto(product))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    update: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const data = updateCatalogProductSchema.parse(req.body)
        const product = await catalogProductService.adminUpdate(req.params.id, data)
        if (data.title !== undefined || data.description !== undefined) {
          await notifyModeration(product.id)
        }
        res.json(toCatalogProductDto(product))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    archive: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        res.json(toCatalogProductDto(await catalogProductService.adminArchive(req.params.id)))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    addVariant: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const data = addVariantSchema.parse(req.body)
        res.status(201).json(toCatalogVariantDto(await catalogProductService.adminAddVariant(req.params.id, data)))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    generateVariants: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const { hint } = req.body as { hint?: string }
        if (!hint?.trim()) {
          res.status(400).json({ error: 'hint is required' })
          return
        }
        const product = await catalogProductQuery.getById(req.params.id)
        if (product.status !== 'active') {
          res.status(400).json({ error: 'Variants can only be generated for active products' })
          return
        }
        const suggestions = await generateVariantsService.generate(
          product.title,
          (product.variants ?? []).map((v) => ({ title: v.title, sku: v.sku, suggestedPrice: v.suggestedPrice })),
          hint.trim(),
        )
        res.json(suggestions)
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    listArchiveCriteria: async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const criteria = await archiveCriteriaService.list()
        res.json(criteria.map(toArchiveCriteriaDto))
      } catch (err) {
        next(err)
      }
    },

    createArchiveCriteria: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const data = archiveCriteriaSchema.parse(req.body)
        res.status(201).json(toArchiveCriteriaDto(await archiveCriteriaService.create(data)))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    updateArchiveCriteria: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const data = updateArchiveCriteriaSchema.parse(req.body)
        res.json(toArchiveCriteriaDto(await archiveCriteriaService.update(req.params.id, data)))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    deleteArchiveCriteria: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        await archiveCriteriaService.delete(req.params.id)
        res.status(204).send()
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    uploadVariantImage: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.file) {
          res.status(400).json({ error: 'No file uploaded' })
          return
        }
        const image = await variantImageService.uploadImage(req.params.id, req.params.variantId, req.file)
        res.status(201).json(toCatalogVariantImageDto(image))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    deleteVariantImage: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        await variantImageService.deleteImage(req.params.id, req.params.variantId, req.params.imageId)
        res.status(204).send()
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },
  }
}
