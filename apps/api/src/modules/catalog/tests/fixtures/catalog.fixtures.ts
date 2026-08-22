import { CatalogProduct } from '../../domain/entities'
import { ArchiveCriteria } from '../../domain/entities'
import type {
  CatalogVariantEntity,
  CatalogVariantImageEntity,
  StoreProductEntity,
  StoreProductVariantEntity,
} from '../../domain/entities'
import type { ProductForArchiveEvaluation } from '../../domain/types'

export function makeProduct(
  overrides: Partial<ConstructorParameters<typeof CatalogProduct>[0]> = {}
): CatalogProduct {
  return new CatalogProduct({
    id: 'p1',
    title: 'T-Shirt',
    description: null,
    categoryId: null,
    productType: null,
    status: 'active',
    aiGenerated: false,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })
}

export function makeVariant(overrides: Partial<CatalogVariantEntity> = {}): CatalogVariantEntity {
  return {
    id: 'v1',
    catalogProductId: 'p1',
    title: 'Red L',
    sku: 'SKU-1',
    suggestedPrice: 29.99,
    createdAt: new Date(),
    ...overrides,
  }
}

export function makeImage(
  overrides: Partial<CatalogVariantImageEntity> = {}
): CatalogVariantImageEntity {
  return {
    id: 'img1',
    catalogVariantId: 'v1',
    url: 'https://cdn.example.com/img.webp',
    altText: null,
    position: 0,
    isPrimary: true,
    createdAt: new Date(),
    ...overrides,
  }
}

export function makeStoreProduct(overrides: Partial<StoreProductEntity> = {}): StoreProductEntity {
  return {
    id: 'sp1',
    storeId: 's1',
    catalogProductId: 'p1',
    addedAt: new Date(),
    shippingCost: 0,
    ...overrides,
  }
}

export function makeStoreVariant(
  overrides: Partial<StoreProductVariantEntity> = {}
): StoreProductVariantEntity {
  return {
    id: 'spv1',
    storeProductId: 'sp1',
    catalogVariantId: 'v1',
    customPrice: null,
    ...overrides,
  }
}

export function makeCriteria(
  overrides: Partial<ConstructorParameters<typeof ArchiveCriteria>[0]> = {}
): ArchiveCriteria {
  return new ArchiveCriteria({
    id: 'c1',
    name: 'Never added',
    criteriaKey: 'never_added_to_store',
    value: '3',
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })
}

export function makeProductForEvaluation(
  overrides: Partial<ProductForArchiveEvaluation> = {}
): ProductForArchiveEvaluation {
  return {
    id: 'p1',
    createdAt: new Date(),
    storeProductCount: 0,
    variantCount: 1,
    rejectedRequestCount: 0,
    ...overrides,
  }
}
