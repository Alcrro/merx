import { OpenAIProvider } from '@merx/llm-provider'
import { CatalogProductService } from './application/services/catalog-product.service'
import { StoreProductService } from './application/services/store-product.service'
import { VariantClassifierService } from './application/services/variant-classifier.service'
import { GenerateVariantsService } from './application/services/generate-variants.service'
import { ArchiveCriteriaService } from './application/services/archive-criteria.service'
import { CatalogVariantImageService } from './application/services/catalog-variant-image.service'
import { CatalogProductQuery } from './application/queries/catalog-product.query'
import { CatalogCategoryQuery } from './application/queries/catalog-category.query'
import { StoreProductAnalyticsQuery } from './application/queries/store-product-analytics.query'
import { StoreProductVariantAnalyticsQuery } from './application/queries/store-product-variant-analytics.query'
import { AddVariantWithClassifyUseCase } from './application/use-cases/add-variant-with-classify.use-case'
import { EvaluateAndArchiveProductsUseCase } from './application/use-cases/evaluate-and-archive-products.use-case'
import { catalogProductRepository } from './infrastructure/db/catalog-product.repository'
import { catalogVariantRepository } from './infrastructure/db/catalog-variant.repository'
import { storeProductRepository } from './infrastructure/db/store-product.repository'
import { catalogCategoryRepository } from './infrastructure/db/catalog-category.repository'
import { analyticsRepository } from './infrastructure/db/analytics.repository'
import { aiToolCriteriaRepository } from './infrastructure/db/ai-tool-criteria.repository'
import { archiveCriteriaRepository } from './infrastructure/db/archive-criteria.repository'
import { CatalogVariantImageRepository } from './infrastructure/db/catalog-variant-image.repository'
import { enqueueModerationJob } from './infrastructure/queue/moderate-content.job'
import { storageProvider } from '../../lib/storage'
import { config } from '../../config'

export interface CatalogContainer {
  catalogProductQuery: CatalogProductQuery
  catalogCategoryQuery: CatalogCategoryQuery
  catalogProductService: CatalogProductService
  storeProductService: StoreProductService
  analyticsQuery: StoreProductAnalyticsQuery
  variantAnalyticsQuery: StoreProductVariantAnalyticsQuery
  addVariantWithClassifyUseCase: AddVariantWithClassifyUseCase
  evaluateAndArchiveUseCase: EvaluateAndArchiveProductsUseCase
  generateVariantsService: GenerateVariantsService
  archiveCriteriaService: ArchiveCriteriaService
  variantImageService: CatalogVariantImageService
  notifyModeration: (productId: string) => Promise<void>
}

export function createCatalogContainer(): CatalogContainer {
  const llm = new OpenAIProvider()
  const catalogProductQuery = new CatalogProductQuery(catalogProductRepository)
  const catalogCategoryQuery = new CatalogCategoryQuery(catalogCategoryRepository)
  const catalogProductService = new CatalogProductService(catalogProductRepository, catalogVariantRepository)
  const storeProductService = new StoreProductService(catalogProductRepository, storeProductRepository)
  const classifierService = new VariantClassifierService(llm, aiToolCriteriaRepository)

  return {
    catalogProductQuery,
    catalogCategoryQuery,
    catalogProductService,
    storeProductService,
    analyticsQuery: new StoreProductAnalyticsQuery(analyticsRepository),
    variantAnalyticsQuery: new StoreProductVariantAnalyticsQuery(analyticsRepository),
    addVariantWithClassifyUseCase: new AddVariantWithClassifyUseCase(catalogProductQuery, catalogProductService, classifierService),
    evaluateAndArchiveUseCase: new EvaluateAndArchiveProductsUseCase(archiveCriteriaRepository),
    generateVariantsService: new GenerateVariantsService(llm),
    archiveCriteriaService: new ArchiveCriteriaService(archiveCriteriaRepository),
    variantImageService: new CatalogVariantImageService(
      new CatalogVariantImageRepository(),
      catalogVariantRepository,
      storageProvider,
      config.storage.publicUrl,
    ),
    notifyModeration: enqueueModerationJob,
  }
}
