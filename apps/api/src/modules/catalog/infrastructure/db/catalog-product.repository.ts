import type { Prisma } from '@prisma/client'
import { prisma } from '../../../../lib/prisma'
import type { ICatalogProductRepository, CreateCatalogProductData, UpdateCatalogProductData } from '../../domain/ports'
import type { CatalogProductEntity, PaginatedCatalogProducts } from '../../domain/entities'
import type { SearchCatalogParams } from '../../domain/types'
import { toProduct } from './mappers/catalog.mapper'

const variantsInclude = {
  orderBy: { createdAt: 'asc' as const },
  include: { images: { orderBy: { position: 'asc' as const } } },
}

const productInclude = {
  category: true,
  variants: variantsInclude,
  _count: { select: { storeProducts: true } },
}

export class CatalogProductRepository implements ICatalogProductRepository {
  async findMany(params: SearchCatalogParams): Promise<PaginatedCatalogProducts> {
    const { search, categoryId, status, page, limit } = params

    const where: Prisma.CatalogProductWhereInput = {
      ...(status ? { status } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    }

    const [data, total] = await Promise.all([
      prisma.catalogProduct.findMany({
        where,
        include: productInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.catalogProduct.count({ where }),
    ])

    return { data: data.map(toProduct), total, page, limit }
  }

  async findById(id: string): Promise<CatalogProductEntity | null> {
    const p = await prisma.catalogProduct.findUnique({ where: { id }, include: productInclude })
    return p ? toProduct(p) : null
  }

  async create(data: CreateCatalogProductData): Promise<CatalogProductEntity> {
    const { variants, categoryId, title, description, productType, status, aiGenerated, metadata } = data
    const p = await prisma.catalogProduct.create({
      data: {
        title,
        ...(description !== undefined ? { description } : {}),
        ...(productType !== undefined ? { productType } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(aiGenerated !== undefined ? { aiGenerated } : {}),
        ...(metadata !== undefined ? { metadata: metadata as Prisma.InputJsonValue } : {}),
        ...(categoryId != null ? { category: { connect: { id: categoryId } } } : {}),
        ...(variants?.length ? { variants: { create: variants } } : {}),
      },
      include: productInclude,
    })
    return toProduct(p)
  }

  async update(id: string, data: UpdateCatalogProductData): Promise<CatalogProductEntity> {
    const { categoryId, title, description, productType, status, metadata } = data
    const p = await prisma.catalogProduct.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(productType !== undefined ? { productType } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(metadata !== undefined ? { metadata: metadata as Prisma.InputJsonValue } : {}),
        ...(categoryId !== undefined ? {
          category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
        } : {}),
      },
      include: productInclude,
    })
    return toProduct(p)
  }

  async archive(id: string): Promise<CatalogProductEntity> {
    const p = await prisma.catalogProduct.update({
      where: { id },
      data: { status: 'archived' },
      include: productInclude,
    })
    return toProduct(p)
  }

  async isReferenced(id: string): Promise<boolean> {
    const count = await prisma.storeProduct.count({ where: { catalogProductId: id } })
    return count > 0
  }
}

export const catalogProductRepository = new CatalogProductRepository()
