import { prisma } from '../../../lib/prisma'
import type { ICatalogVariantImageRepository, CreateCatalogVariantImageData } from '../domain/ports'
import type { CatalogVariantImageEntity } from '../domain/entities'

function toImage(r: {
  id: string
  catalogVariantId: string
  url: string
  altText: string | null
  position: number
  isPrimary: boolean
  createdAt: Date
}): CatalogVariantImageEntity {
  return {
    id: r.id,
    catalogVariantId: r.catalogVariantId,
    url: r.url,
    altText: r.altText ?? null,
    position: r.position,
    isPrimary: r.isPrimary,
    createdAt: r.createdAt,
  }
}

export class CatalogVariantImageRepository implements ICatalogVariantImageRepository {
  async findByVariantId(variantId: string): Promise<CatalogVariantImageEntity[]> {
    const rows = await prisma.catalogVariantImage.findMany({
      where: { catalogVariantId: variantId },
      orderBy: { position: 'asc' },
    })
    return rows.map(toImage)
  }

  async findById(id: string): Promise<CatalogVariantImageEntity | null> {
    const row = await prisma.catalogVariantImage.findUnique({ where: { id } })
    return row ? toImage(row) : null
  }

  async countByVariantId(variantId: string): Promise<number> {
    return prisma.catalogVariantImage.count({ where: { catalogVariantId: variantId } })
  }

  async create(data: CreateCatalogVariantImageData): Promise<CatalogVariantImageEntity> {
    const row = await prisma.catalogVariantImage.create({ data })
    return toImage(row)
  }

  async delete(id: string): Promise<void> {
    await prisma.catalogVariantImage.delete({ where: { id } })
  }

  async updatePositions(variantId: string, orderedIds: string[]): Promise<void> {
    await prisma.$transaction(
      orderedIds.map((id, position) =>
        prisma.catalogVariantImage.update({ where: { id }, data: { position } })
      )
    )
  }

  async promoteFirstRemaining(variantId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.catalogVariantImage.updateMany({
        where: { catalogVariantId: variantId },
        data: { isPrimary: false },
      })
      const first = await tx.catalogVariantImage.findFirst({
        where: { catalogVariantId: variantId },
        orderBy: { position: 'asc' },
      })
      if (first) {
        await tx.catalogVariantImage.update({
          where: { id: first.id },
          data: { isPrimary: true },
        })
      }
    })
  }
}
