import type { ProductForArchiveEvaluation } from '../types'

export class ArchiveCriteria {
  readonly id: string
  readonly name: string
  readonly criteriaKey: string
  readonly value: string
  readonly enabled: boolean
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(data: {
    id: string
    name: string
    criteriaKey: string
    value: string
    enabled: boolean
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = data.id
    this.name = data.name
    this.criteriaKey = data.criteriaKey
    this.value = data.value
    this.enabled = data.enabled
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  shouldArchive(product: ProductForArchiveEvaluation): boolean {
    const now = new Date()
    switch (this.criteriaKey) {
      case 'never_added_to_store': {
        if (product.storeProductCount > 0) return false
        const months = parseInt(this.value, 10)
        const monthsOld = (now.getTime() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
        return monthsOld >= months
      }
      case 'no_active_variants':
        return product.variantCount === 0
      case 'rejected_requests': {
        const threshold = parseInt(this.value, 10)
        return product.rejectedRequestCount >= threshold
      }
      default:
        return false
    }
  }
}

export type ArchiveCriteriaEntity = ArchiveCriteria
