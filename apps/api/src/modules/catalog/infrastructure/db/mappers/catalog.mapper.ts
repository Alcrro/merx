import type { Prisma } from '@prisma/client'
import {
  CatalogProduct,
} from '../../../domain/entities'
import type {
  CatalogCategoryEntity,
  CatalogVariantEntity,
  CatalogVariantImageEntity,
  StoreProductEntity,
  StoreProductVariantEntity,
} from '../../../domain/entities'
import type { CatalogProductStatus } from '../../../domain/types'

export interface RawCatalogVariantImage {
  id: string
  catalogVariantId: string
  url: string
  altText: string | null
  position: number
  isPrimary: boolean
  createdAt: Date
}

export interface RawCatalogVariant {
  id: string
  catalogProductId: string
  title: string
  sku: string
  suggestedPrice: Prisma.Decimal
  createdAt: Date
  images?: RawCatalogVariantImage[]
}

export interface RawCatalogCategory {
  id: string
  name: string
  slug: string
  parentId: string | null
  children?: RawCatalogCategory[]
}

export interface RawCatalogProduct {
  id: string
  title: string
  description: string | null
  categoryId: string | null
  productType: string | null
  status: string
  aiGenerated: boolean
  metadata: Prisma.JsonValue
  createdAt: Date
  updatedAt: Date
  category?: RawCatalogCategory | null
  variants?: RawCatalogVariant[]
  _count?: { storeProducts: number }
}

export interface RawStoreProductVariant {
  id: string
  storeProductId: string
  catalogVariantId: string
  customPrice: Prisma.Decimal | null
  catalogVariant?: RawCatalogVariant
}

export interface RawStoreProduct {
  id: string
  storeId: string
  catalogProductId: string
  addedAt: Date
  shippingCost: Prisma.Decimal
  catalogProduct?: RawCatalogProduct
  variants?: RawStoreProductVariant[]
}

export function toVariantImage(img: RawCatalogVariantImage): CatalogVariantImageEntity {
  return {
    id: img.id,
    catalogVariantId: img.catalogVariantId,
    url: img.url,
    altText: img.altText,
    position: img.position,
    isPrimary: img.isPrimary,
    createdAt: img.createdAt,
  }
}

export function toVariant(v: RawCatalogVariant): CatalogVariantEntity {
  return {
    id: v.id,
    catalogProductId: v.catalogProductId,
    title: v.title,
    sku: v.sku,
    suggestedPrice: Number(v.suggestedPrice),
    createdAt: v.createdAt,
    images: v.images?.map(toVariantImage),
  }
}

function toCategory(c: RawCatalogCategory): CatalogCategoryEntity {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId,
    children: c.children?.map(toCategory),
  }
}

export function toProduct(p: RawCatalogProduct): CatalogProduct {
  return new CatalogProduct({
    id: p.id,
    title: p.title,
    description: p.description,
    categoryId: p.categoryId,
    productType: p.productType,
    status: p.status as CatalogProductStatus,
    aiGenerated: p.aiGenerated,
    metadata: (p.metadata ?? {}) as Record<string, unknown>,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    category: p.category != null ? toCategory(p.category) : p.category,
    variants: p.variants?.map(toVariant),
    storeCount: p._count?.storeProducts,
  })
}

export function toStoreProductVariant(v: RawStoreProductVariant): StoreProductVariantEntity {
  return {
    id: v.id,
    storeProductId: v.storeProductId,
    catalogVariantId: v.catalogVariantId,
    customPrice: v.customPrice !== null ? Number(v.customPrice) : null,
    catalogVariant: v.catalogVariant ? toVariant(v.catalogVariant) : undefined,
  }
}

export function toStoreProduct(sp: RawStoreProduct): StoreProductEntity {
  return {
    id: sp.id,
    storeId: sp.storeId,
    catalogProductId: sp.catalogProductId,
    addedAt: sp.addedAt,
    shippingCost: Number(sp.shippingCost),
    catalogProduct: sp.catalogProduct ? toProduct(sp.catalogProduct) : undefined,
    variants: sp.variants?.map(toStoreProductVariant),
  }
}
