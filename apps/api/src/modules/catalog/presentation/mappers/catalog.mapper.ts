import type {
  ArchiveCriteriaEntity,
  CatalogCategoryEntity,
  CatalogProductEntity,
  CatalogVariantEntity,
  CatalogVariantImageEntity,
  StoreProductEntity,
  StoreProductVariantEntity,
  PaginatedCatalogProducts,
} from '../../domain/entities'
import type {
  ArchiveCriteriaDto,
  CatalogCategoryDto,
  CatalogProductDto,
  CatalogVariantDto,
  CatalogVariantImageDto,
  PaginatedCatalogProductsDto,
  StoreProductDto,
  StoreProductVariantDto,
} from '../dto/catalog.dto'

export function toCatalogVariantImageDto(e: CatalogVariantImageEntity): CatalogVariantImageDto {
  return {
    id: e.id,
    catalogVariantId: e.catalogVariantId,
    url: e.url,
    altText: e.altText,
    position: e.position,
    isPrimary: e.isPrimary,
    createdAt: e.createdAt,
  }
}

export function toCatalogVariantDto(e: CatalogVariantEntity): CatalogVariantDto {
  return {
    id: e.id,
    catalogProductId: e.catalogProductId,
    title: e.title,
    sku: e.sku,
    suggestedPrice: e.suggestedPrice,
    createdAt: e.createdAt,
    images: e.images?.map(toCatalogVariantImageDto),
  }
}

export function toCatalogCategoryDto(e: CatalogCategoryEntity): CatalogCategoryDto {
  return {
    id: e.id,
    name: e.name,
    slug: e.slug,
    parentId: e.parentId,
    parent: e.parent ? toCatalogCategoryDto(e.parent) : e.parent,
    children: e.children?.map(toCatalogCategoryDto),
  }
}

export function toCatalogProductDto(e: CatalogProductEntity): CatalogProductDto {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    categoryId: e.categoryId,
    productType: e.productType,
    status: e.status,
    aiGenerated: e.aiGenerated,
    metadata: e.metadata,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    category: e.category ? toCatalogCategoryDto(e.category) : e.category,
    variants: e.variants?.map(toCatalogVariantDto),
    storeCount: e.storeCount,
  }
}

export function toStoreProductVariantDto(e: StoreProductVariantEntity): StoreProductVariantDto {
  return {
    id: e.id,
    storeProductId: e.storeProductId,
    catalogVariantId: e.catalogVariantId,
    customPrice: e.customPrice,
    catalogVariant: e.catalogVariant ? toCatalogVariantDto(e.catalogVariant) : undefined,
  }
}

export function toStoreProductDto(e: StoreProductEntity): StoreProductDto {
  return {
    id: e.id,
    storeId: e.storeId,
    catalogProductId: e.catalogProductId,
    addedAt: e.addedAt,
    shippingCost: e.shippingCost,
    catalogProduct: e.catalogProduct ? toCatalogProductDto(e.catalogProduct) : undefined,
    variants: e.variants?.map(toStoreProductVariantDto),
  }
}

export function toPaginatedCatalogProductsDto(e: PaginatedCatalogProducts): PaginatedCatalogProductsDto {
  return {
    data: e.data.map(toCatalogProductDto),
    total: e.total,
    page: e.page,
    limit: e.limit,
  }
}

export function toArchiveCriteriaDto(e: ArchiveCriteriaEntity): ArchiveCriteriaDto {
  return {
    id: e.id,
    name: e.name,
    criteriaKey: e.criteriaKey,
    value: e.value,
    enabled: e.enabled,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }
}
