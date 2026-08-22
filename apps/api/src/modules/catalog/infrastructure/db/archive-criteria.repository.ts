import { prisma } from '../../../../lib/prisma'
import type { IArchiveCriteriaRepository, CreateArchiveCriteriaData, UpdateArchiveCriteriaData } from '../../domain/ports'
import { ArchiveCriteria } from '../../domain/entities'
import type { ProductForArchiveEvaluation } from '../../domain/types'

export class ArchiveCriteriaRepository implements IArchiveCriteriaRepository {
  async findAll(): Promise<ArchiveCriteria[]> {
    const rows = await prisma.archiveCriteria.findMany({ orderBy: { createdAt: 'asc' } })
    return rows.map((r) => new ArchiveCriteria(r))
  }

  async findEnabled(): Promise<ArchiveCriteria[]> {
    const rows = await prisma.archiveCriteria.findMany({ where: { enabled: true } })
    return rows.map((r) => new ArchiveCriteria(r))
  }

  async findByKey(criteriaKey: string): Promise<ArchiveCriteria | null> {
    const row = await prisma.archiveCriteria.findUnique({ where: { criteriaKey } })
    return row ? new ArchiveCriteria(row) : null
  }

  async findById(id: string): Promise<ArchiveCriteria | null> {
    const row = await prisma.archiveCriteria.findUnique({ where: { id } })
    return row ? new ArchiveCriteria(row) : null
  }

  async create(data: CreateArchiveCriteriaData): Promise<ArchiveCriteria> {
    const row = await prisma.archiveCriteria.create({ data })
    return new ArchiveCriteria(row)
  }

  async update(id: string, data: UpdateArchiveCriteriaData): Promise<ArchiveCriteria> {
    const row = await prisma.archiveCriteria.update({ where: { id }, data })
    return new ArchiveCriteria(row)
  }

  async delete(id: string): Promise<void> {
    await prisma.archiveCriteria.delete({ where: { id } })
  }

  async findActiveProductsForEvaluation(): Promise<ProductForArchiveEvaluation[]> {
    const products = await prisma.catalogProduct.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        createdAt: true,
        _count: {
          select: {
            storeProducts: true,
            variants: true,
          },
        },
        requests: {
          where: { status: 'rejected' },
          select: { id: true },
        },
      },
    })

    return products.map((p) => ({
      id: p.id,
      createdAt: p.createdAt,
      storeProductCount: p._count.storeProducts,
      variantCount: p._count.variants,
      rejectedRequestCount: p.requests.length,
    }))
  }

  async archiveMany(ids: string[]): Promise<void> {
    await prisma.catalogProduct.updateMany({
      where: { id: { in: ids } },
      data: { status: 'archived' },
    })
  }
}

export const archiveCriteriaRepository = new ArchiveCriteriaRepository()
