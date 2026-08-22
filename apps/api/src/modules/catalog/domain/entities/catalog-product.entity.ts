import { CatalogError } from '../errors'
import type { CatalogProductStatus } from '../types'
import type { CatalogCategoryEntity } from './catalog-category.entity'
import type { CatalogVariantEntity } from './catalog-variant.entity'

export class CatalogProduct {
  readonly id: string
  readonly title: string
  readonly description: string | null
  readonly categoryId: string | null
  readonly productType: string | null
  status: CatalogProductStatus
  readonly aiGenerated: boolean
  readonly metadata: Record<string, unknown>
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly category?: CatalogCategoryEntity | null
  readonly variants?: CatalogVariantEntity[]
  readonly storeCount?: number

  constructor(data: {
    id: string
    title: string
    description: string | null
    categoryId: string | null
    productType: string | null
    status: CatalogProductStatus
    aiGenerated: boolean
    metadata: Record<string, unknown>
    createdAt: Date
    updatedAt: Date
    category?: CatalogCategoryEntity | null
    variants?: CatalogVariantEntity[]
    storeCount?: number
  }) {
    this.id = data.id
    this.title = data.title
    this.description = data.description
    this.categoryId = data.categoryId
    this.productType = data.productType
    this.status = data.status
    this.aiGenerated = data.aiGenerated
    this.metadata = data.metadata
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
    this.category = data.category
    this.variants = data.variants
    this.storeCount = data.storeCount
  }

  archive(): void {
    if (this.status === 'archived') throw new CatalogError('Product is already archived', 'CONFLICT')
    this.status = 'archived'
  }

  guardCanUpdate(): void {
    if (this.status === 'archived') throw new CatalogError('Cannot update an archived product', 'INVALID')
  }

  guardActive(): void {
    if (this.status !== 'active') throw new CatalogError('Product is not active', 'INVALID')
  }
}

export type CatalogProductEntity = CatalogProduct
