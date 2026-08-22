export type { ICatalogProductRepository, ICatalogVariantRepository, CreateCatalogProductData, UpdateCatalogProductData, CreateCatalogVariantData } from './catalog-product.repository.port'
export type { IStoreProductRepository } from './store-product.repository.port'
export type { ICatalogCategoryRepository } from './catalog-category.repository.port'
export type { ICatalogVariantImageRepository, CreateCatalogVariantImageData } from './catalog-variant-image.repository.port'
export type { IArchiveCriteriaRepository, CreateArchiveCriteriaData, UpdateArchiveCriteriaData } from './archive-criteria.repository.port'
export type { IModerationRepository } from './moderation.repository.port'
export type { IAnalyticsRepository } from './analytics.repository.port'
export type { IAIToolCriteriaRepository } from './ai-tool-criteria.repository.port'

import type { ICatalogProductRepository, ICatalogVariantRepository } from './catalog-product.repository.port'
import type { IStoreProductRepository } from './store-product.repository.port'
import type { ICatalogCategoryRepository } from './catalog-category.repository.port'

export type ICatalogRepository =
  ICatalogProductRepository &
  ICatalogVariantRepository &
  IStoreProductRepository &
  ICatalogCategoryRepository
