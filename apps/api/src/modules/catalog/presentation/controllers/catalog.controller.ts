import type { Response, NextFunction } from 'express'
import type { AuthenticatedStoreRequest as AuthenticatedRequest } from '../../../../middleware/authenticate'
import type { CatalogProductQuery } from '../../application/queries/catalog-product.query'
import type { CatalogCategoryQuery } from '../../application/queries/catalog-category.query'
import type { StoreProductService } from '../../application/services/store-product.service'
import type { StoreProductAnalyticsQuery } from '../../application/queries/store-product-analytics.query'
import type { StoreProductVariantAnalyticsQuery } from '../../application/queries/store-product-variant-analytics.query'
import type { AddVariantWithClassifyUseCase } from '../../application/use-cases/add-variant-with-classify.use-case'
import {
  searchCatalogSchema,
  addVariantSchema,
  updateVariantPriceSchema,
  updateStoreProductSchema,
} from '../validators/catalog.validator'
import { handleCatalogError } from '../errors/catalog.errors'
import {
  toCatalogProductDto,
  toPaginatedCatalogProductsDto,
  toStoreProductDto,
  toStoreProductVariantDto,
  toCatalogVariantDto,
} from '../mappers/catalog.mapper'

export interface CatalogControllerDeps {
  catalogProductQuery: CatalogProductQuery
  catalogCategoryQuery: CatalogCategoryQuery
  storeProductService: StoreProductService
  analyticsQuery: StoreProductAnalyticsQuery
  variantAnalyticsQuery: StoreProductVariantAnalyticsQuery
  addVariantWithClassifyUseCase: AddVariantWithClassifyUseCase
}

export function createCatalogController(deps: CatalogControllerDeps) {
  const { catalogProductQuery, catalogCategoryQuery, storeProductService, analyticsQuery, variantAnalyticsQuery, addVariantWithClassifyUseCase } = deps

  return {
    search: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const params = searchCatalogSchema.parse(req.query)
        res.json(toPaginatedCatalogProductsDto(await catalogProductQuery.search(params)))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        res.json(toCatalogProductDto(await catalogProductQuery.getById(req.params.id)))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    addToStore: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const { variantIds } = req.body as { variantIds?: string[] }
        const storeProduct = await storeProductService.addToStore(
          req.user.storeId,
          req.params.catalogProductId,
          Array.isArray(variantIds) ? variantIds : [],
        )
        res.status(201).json(toStoreProductDto(storeProduct))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    getMyStoreProducts: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const products = await storeProductService.getStoreProducts(req.user.storeId)
        res.json(products.map(toStoreProductDto))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    getStoreProduct: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        res.json(toStoreProductDto(await storeProductService.getStoreProduct(req.params.storeProductId, req.user.storeId)))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    updateStoreProduct: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const data = updateStoreProductSchema.parse(req.body)
        res.json(toStoreProductDto(await storeProductService.updateStoreProduct(req.params.storeProductId, req.user.storeId, data)))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    updateVariantPrice: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const { customPrice } = updateVariantPriceSchema.parse(req.body)
        const variant = await storeProductService.updateVariantPrice(
          req.params.storeProductId,
          req.user.storeId,
          req.params.catalogVariantId,
          customPrice,
        )
        res.json(toStoreProductVariantDto(variant))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    addVariantToStore: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const variant = await storeProductService.addVariantToStore(
          req.params.storeProductId,
          req.params.catalogVariantId,
          req.user.storeId,
        )
        res.status(201).json(toStoreProductVariantDto(variant))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    removeVariantFromStore: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        await storeProductService.removeVariantFromStore(req.params.storeProductId, req.params.catalogVariantId, req.user.storeId)
        res.status(204).send()
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    getStoreProductAnalytics: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        res.json(await analyticsQuery.getAnalytics(req.params.storeProductId, req.user.storeId))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    getStoreProductVariantAnalytics: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        res.json(await variantAnalyticsQuery.getAnalytics(req.params.storeProductId, req.params.catalogVariantId, req.user.storeId))
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },

    listCategories: async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        res.json(await catalogCategoryQuery.listCategories())
      } catch (err) {
        next(err)
      }
    },

    addVariantWithClassify: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const data = addVariantSchema.parse(req.body)
        const result = await addVariantWithClassifyUseCase.execute(req.params.catalogProductId, data)

        if (result.outcome === 'rejected') {
          res.status(422).json({
            classification: 'new_product',
            confidence: result.confidence,
            reason: result.reason,
            suggestion: 'Consider submitting a new product request instead',
          })
          return
        }

        res.status(201).json({
          variant: toCatalogVariantDto(result.variant),
          classification: result.classification,
          confidence: result.confidence,
          ...(result.lowConfidenceWarning ? { warning: 'Classification confidence is low — admin will review' } : {}),
        })
      } catch (err) {
        if (!handleCatalogError(err, res)) next(err)
      }
    },
  }
}
