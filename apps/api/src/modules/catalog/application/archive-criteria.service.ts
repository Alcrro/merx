import { prisma } from '../../../lib/prisma'

export interface ArchiveCriteriaEntity {
  id: string
  name: string
  criteriaKey: string
  value: string
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateArchiveCriteriaData {
  name: string
  criteriaKey: string
  value: string
  enabled?: boolean
}

export interface UpdateArchiveCriteriaData {
  name?: string
  value?: string
  enabled?: boolean
}

export class ArchiveCriteriaError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'CONFLICT'
  ) {
    super(message)
    this.name = 'ArchiveCriteriaError'
  }
}

export async function listArchiveCriteria(): Promise<ArchiveCriteriaEntity[]> {
  return prisma.archiveCriteria.findMany({ orderBy: { createdAt: 'asc' } })
}

export async function createArchiveCriteria(data: CreateArchiveCriteriaData): Promise<ArchiveCriteriaEntity> {
  const existing = await prisma.archiveCriteria.findUnique({ where: { criteriaKey: data.criteriaKey } })
  if (existing) throw new ArchiveCriteriaError(`Criteria key '${data.criteriaKey}' already exists`, 'CONFLICT')

  return prisma.archiveCriteria.create({ data })
}

export async function updateArchiveCriteria(id: string, data: UpdateArchiveCriteriaData): Promise<ArchiveCriteriaEntity> {
  const existing = await prisma.archiveCriteria.findUnique({ where: { id } })
  if (!existing) throw new ArchiveCriteriaError('Archive criteria not found', 'NOT_FOUND')

  return prisma.archiveCriteria.update({ where: { id }, data })
}

export async function deleteArchiveCriteria(id: string): Promise<void> {
  const existing = await prisma.archiveCriteria.findUnique({ where: { id } })
  if (!existing) throw new ArchiveCriteriaError('Archive criteria not found', 'NOT_FOUND')

  await prisma.archiveCriteria.delete({ where: { id } })
}

// Called by the auto-archive BullMQ job
export async function evaluateAndArchive(): Promise<{ archived: number }> {
  const criteria = await prisma.archiveCriteria.findMany({ where: { enabled: true } })
  if (criteria.length === 0) return { archived: 0 }

  const activeProducts = await prisma.catalogProduct.findMany({
    where: { status: 'active' },
    include: { storeProducts: true, requests: true, variants: true },
  })

  const toArchiveIds = new Set<string>()

  for (const product of activeProducts) {
    for (const criterion of criteria) {
      if (shouldArchive(product, criterion)) {
        toArchiveIds.add(product.id)
        break
      }
    }
  }

  if (toArchiveIds.size === 0) return { archived: 0 }

  await prisma.catalogProduct.updateMany({
    where: { id: { in: Array.from(toArchiveIds) } },
    data: { status: 'archived' },
  })

  return { archived: toArchiveIds.size }
}

type ProductWithRelations = Awaited<ReturnType<typeof prisma.catalogProduct.findMany<{
  include: { storeProducts: true; requests: true; variants: true }
}>>>[number]

function shouldArchive(product: ProductWithRelations, criterion: { criteriaKey: string; value: string }): boolean {
  const now = new Date()

  switch (criterion.criteriaKey) {
    case 'never_added_to_store': {
      const months = parseInt(criterion.value, 10)
      if (product.storeProducts.length > 0) return false
      const monthsOld = (now.getTime() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
      return monthsOld >= months
    }

    case 'no_active_variants': {
      return product.variants.length === 0
    }

    case 'rejected_requests': {
      const threshold = parseInt(criterion.value, 10)
      const rejected = product.requests.filter((r) => r.status === 'rejected').length
      return rejected >= threshold
    }

    // no_sales_months and low_rating require order/rating data not yet in schema
    default:
      return false
  }
}
