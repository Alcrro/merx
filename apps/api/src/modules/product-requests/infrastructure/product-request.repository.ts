import { prisma } from '../../../lib/prisma'
import type { IProductRequestRepository, CreateProductRequestData, UpdateStatusExtra, ListRequestsFilter } from '../domain/ports'
import type { ProductRequestEntity, ProductRequestStatus } from '../domain/entities'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toEntity(r: any): ProductRequestEntity {
  return {
    id: r.id,
    storeId: r.storeId,
    requestedTitle: r.requestedTitle,
    description: r.description ?? null,
    category: r.category ?? null,
    status: r.status as ProductRequestStatus,
    rejectionReason: r.rejectionReason ?? null,
    catalogProductId: r.catalogProductId ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    duplicateCount: r._count?.id,
  }
}

export class ProductRequestRepository implements IProductRequestRepository {
  async findById(id: string): Promise<ProductRequestEntity | null> {
    const r = await prisma.productRequest.findUnique({ where: { id } })
    return r ? toEntity(r) : null
  }

  async findByStoreId(storeId: string): Promise<ProductRequestEntity[]> {
    const rows = await prisma.productRequest.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toEntity)
  }

  async findDuplicate(storeId: string, requestedTitle: string): Promise<ProductRequestEntity | null> {
    const r = await prisma.productRequest.findFirst({
      where: {
        storeId,
        requestedTitle: { equals: requestedTitle, mode: 'insensitive' },
        status: { not: 'rejected' },
      },
    })
    return r ? toEntity(r) : null
  }

  async findAll(filters: ListRequestsFilter): Promise<ProductRequestEntity[]> {
    const rows = await prisma.productRequest.findMany({
      where: { ...(filters.status && { status: filters.status }) },
      orderBy: { createdAt: 'desc' },
    })

    // Attach duplicate count (how many stores requested same title)
    const titles = [...new Set(rows.map((r) => r.requestedTitle))]
    const counts = await Promise.all(
      titles.map((title) =>
        prisma.productRequest.groupBy({
          by: ['requestedTitle'],
          where: { requestedTitle: { equals: title, mode: 'insensitive' } },
          _count: { id: true },
        })
      )
    )
    const countMap = new Map<string, number>()
    counts.flat().forEach((g) => countMap.set(g.requestedTitle.toLowerCase(), g._count.id))

    return rows.map((r) => ({
      ...toEntity(r),
      duplicateCount: countMap.get(r.requestedTitle.toLowerCase()) ?? 1,
    }))
  }

  async countByTitle(requestedTitle: string): Promise<number> {
    return prisma.productRequest.count({
      where: { requestedTitle: { equals: requestedTitle, mode: 'insensitive' } },
    })
  }

  async create(data: CreateProductRequestData): Promise<ProductRequestEntity> {
    const r = await prisma.productRequest.create({ data })
    return toEntity(r)
  }

  async updateStatus(id: string, status: ProductRequestStatus, extra?: UpdateStatusExtra): Promise<ProductRequestEntity> {
    const r = await prisma.productRequest.update({
      where: { id },
      data: {
        status,
        ...(extra?.rejectionReason !== undefined && { rejectionReason: extra.rejectionReason }),
        ...(extra?.catalogProductId !== undefined && { catalogProductId: extra.catalogProductId }),
      },
    })
    return toEntity(r)
  }

  async bulkUpdateStatus(ids: string[], status: ProductRequestStatus, extra?: UpdateStatusExtra): Promise<number> {
    const result = await prisma.productRequest.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        ...(extra?.rejectionReason !== undefined && { rejectionReason: extra.rejectionReason }),
      },
    })
    return result.count
  }
}

export const productRequestRepository = new ProductRequestRepository()
