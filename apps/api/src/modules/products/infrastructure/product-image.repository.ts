import { prisma } from '../../../lib/prisma'
import type { IProductImageRepository, CreateProductImageData } from '../domain/ports'
import type { ProductImageEntity } from '../domain/entities'

function toEntity(row: {
  id: string
  productId: string
  url: string
  altText: string | null
  position: number
  isPrimary: boolean
  createdAt: Date
}): ProductImageEntity {
  return {
    id: row.id,
    productId: row.productId,
    url: row.url,
    altText: row.altText,
    position: row.position,
    isPrimary: row.isPrimary,
    createdAt: row.createdAt,
  }
}

export class ProductImageRepository implements IProductImageRepository {
  async findByProductId(productId: string): Promise<ProductImageEntity[]> {
    const rows = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { position: 'asc' },
    })
    return rows.map(toEntity)
  }

  async findById(id: string): Promise<ProductImageEntity | null> {
    const row = await prisma.productImage.findUnique({ where: { id } })
    return row ? toEntity(row) : null
  }

  async countByProductId(productId: string): Promise<number> {
    return prisma.productImage.count({ where: { productId } })
  }

  async create(data: CreateProductImageData): Promise<ProductImageEntity> {
    const row = await prisma.productImage.create({ data })
    return toEntity(row)
  }

  async delete(id: string): Promise<void> {
    await prisma.productImage.delete({ where: { id } })
  }

  async updatePositions(updates: { id: string; position: number }[]): Promise<void> {
    await prisma.$transaction(
      updates.map(({ id, position }) =>
        prisma.productImage.update({ where: { id }, data: { position } }),
      ),
    )
  }

  async promoteFirstRemaining(productId: string): Promise<void> {
    const first = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { position: 'asc' },
    })
    if (!first) return
    await prisma.$transaction([
      prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
      prisma.productImage.update({ where: { id: first.id }, data: { isPrimary: true } }),
    ])
  }
}
