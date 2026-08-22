import type { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import type { ICatalogRepository, CreateCatalogProductData, UpdateCatalogProductData, CreateCatalogVariantData } from '../domain/ports'
import type {
  CatalogCategoryEntity,
  CatalogProductEntity,
  CatalogVariantEntity,
  CatalogProductStatus,
  PaginatedCatalogProducts,
  SearchCatalogParams,
  StoreProductEntity,
  StoreProductVariantEntity,
} from '../domain/entities'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toVariant(v: any): CatalogVariantEntity {
  return {
    id: v.id,
    catalogProductId: v.catalogProductId,
    title: v.title,
    sku: v.sku,
    suggestedPrice: Number(v.suggestedPrice),
    createdAt: v.createdAt,
    images: v.images?.map((img: any) => ({
      id: img.id,
      catalogVariantId: img.catalogVariantId,
      url: img.url,
      altText: img.altText ?? null,
      position: img.position,
      isPrimary: img.isPrimary,
      createdAt: img.createdAt,
    })),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProduct(p: any): CatalogProductEntity {
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? null,
    categoryId: p.categoryId ?? null,
    productType: p.productType ?? null,
    status: p.status as CatalogProductStatus,
    aiGenerated: p.aiGenerated,
    metadata: (p.metadata as Record<string, unknown>) ?? {},
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    category: p.category ?? null,
    variants: p.variants?.map(toVariant) ?? undefined,
    storeCount: p._count?.storeProducts,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toStoreProductVariant(v: any): StoreProductVariantEntity {
  return {
    id: v.id,
    storeProductId: v.storeProductId,
    catalogVariantId: v.catalogVariantId,
    customPrice: v.customPrice !== null ? Number(v.customPrice) : null,
    catalogVariant: v.catalogVariant ? toVariant(v.catalogVariant) : undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toStoreProduct(sp: any): StoreProductEntity {
  return {
    id: sp.id,
    storeId: sp.storeId,
    catalogProductId: sp.catalogProductId,
    addedAt: sp.addedAt,
    shippingCost: Number(sp.shippingCost ?? 0),
    catalogProduct: sp.catalogProduct ? toProduct(sp.catalogProduct) : undefined,
    variants: sp.variants?.map(toStoreProductVariant) ?? undefined,
  }
}

const variantsInclude = {
  orderBy: { createdAt: 'asc' as const },
  include: { images: { orderBy: { position: 'asc' as const } } },
}

const productInclude = {
  category: true,
  variants: variantsInclude,
  _count: { select: { storeProducts: true } },
}

export class CatalogRepository implements ICatalogRepository {
  async findMany(params: SearchCatalogParams): Promise<PaginatedCatalogProducts> {
    const { search, categoryId, status, page, limit } = params

    const where: Prisma.CatalogProductWhereInput = {
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
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
    const p = await prisma.catalogProduct.findUnique({
      where: { id },
      include: productInclude,
    })
    return p ? toProduct(p) : null
  }

  async create(data: CreateCatalogProductData): Promise<CatalogProductEntity> {
    const { variants, categoryId, ...rest } = data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = await prisma.catalogProduct.create({
      data: {
        ...rest,
        ...(categoryId != null && { category: { connect: { id: categoryId } } }),
        ...(variants?.length && { variants: { create: variants } }),
      } as any,
      include: productInclude,
    })
    return toProduct(p)
  }

  async update(id: string, data: UpdateCatalogProductData): Promise<CatalogProductEntity> {
    const { categoryId, ...rest } = data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = await prisma.catalogProduct.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId !== undefined && {
          category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
        }),
      } as any,
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

  async createVariant(catalogProductId: string, data: CreateCatalogVariantData): Promise<CatalogVariantEntity> {
    const v = await prisma.catalogVariant.create({
      data: { catalogProductId, ...data },
    })
    return toVariant(v)
  }

  // ─── Store Products ───────────────────────────────────────────────────────────

  async addToStore(storeId: string, catalogProductId: string, variantIds: string[]): Promise<StoreProductEntity> {
    const sp = await prisma.$transaction(async (tx) => {
      const storeProduct = await tx.storeProduct.upsert({
        where: { storeId_catalogProductId: { storeId, catalogProductId } },
        update: {},
        create: { storeId, catalogProductId },
      })

      if (variantIds.length > 0) {
        await tx.storeProductVariant.createMany({
          data: variantIds.map((catalogVariantId) => ({ storeProductId: storeProduct.id, catalogVariantId })),
          skipDuplicates: true,
        })
      }

      return storeProduct
    })

    return this.findStoreProductById(sp.id, storeId) as Promise<StoreProductEntity>
  }

  async getStoreProducts(storeId: string): Promise<StoreProductEntity[]> {
    const items = await prisma.storeProduct.findMany({
      where: { storeId },
      include: {
        catalogProduct: { include: { category: true, variants: true, _count: { select: { storeProducts: true } } } },
        variants: { include: { catalogVariant: true } },
      },
      orderBy: { addedAt: 'desc' },
    })
    return items.map(toStoreProduct)
  }

  async findStoreProduct(storeId: string, catalogProductId: string): Promise<StoreProductEntity | null> {
    const sp = await prisma.storeProduct.findUnique({
      where: { storeId_catalogProductId: { storeId, catalogProductId } },
      include: {
        catalogProduct: { include: { category: true, variants: true, _count: { select: { storeProducts: true } } } },
        variants: { include: { catalogVariant: true } },
      },
    })
    return sp ? toStoreProduct(sp) : null
  }

  async findStoreProductById(storeProductId: string, storeId: string): Promise<StoreProductEntity | null> {
    const sp = await prisma.storeProduct.findFirst({
      where: { id: storeProductId, storeId },
      include: {
        catalogProduct: { include: { category: true, variants: true, _count: { select: { storeProducts: true } } } },
        variants: { include: { catalogVariant: true } },
      },
    })
    return sp ? toStoreProduct(sp) : null
  }

  async updateStoreProduct(storeProductId: string, data: { shippingCost?: number }): Promise<StoreProductEntity> {
    const sp = await prisma.storeProduct.update({
      where: { id: storeProductId },
      data: { ...(data.shippingCost !== undefined && { shippingCost: data.shippingCost }) },
      include: {
        catalogProduct: { include: { category: true, variants: true, _count: { select: { storeProducts: true } } } },
        variants: { include: { catalogVariant: true } },
      },
    })
    return toStoreProduct(sp)
  }

  async addStoreVariant(storeProductId: string, catalogVariantId: string): Promise<StoreProductVariantEntity> {
    const spv = await prisma.storeProductVariant.upsert({
      where: { storeProductId_catalogVariantId: { storeProductId, catalogVariantId } },
      update: {},
      create: { storeProductId, catalogVariantId },
      include: { catalogVariant: true },
    })
    return toStoreProductVariant(spv)
  }

  async removeStoreVariant(storeProductId: string, catalogVariantId: string): Promise<void> {
    await prisma.storeProductVariant.deleteMany({
      where: { storeProductId, catalogVariantId },
    })
  }

  async updateStoreVariantPrice(
    storeProductId: string,
    catalogVariantId: string,
    customPrice: number | null
  ): Promise<StoreProductVariantEntity> {
    const spv = await prisma.storeProductVariant.upsert({
      where: { storeProductId_catalogVariantId: { storeProductId, catalogVariantId } },
      update: { customPrice: customPrice !== null ? customPrice : null },
      create: { storeProductId, catalogVariantId, customPrice: customPrice !== null ? customPrice : null },
      include: { catalogVariant: true },
    })
    return toStoreProductVariant(spv)
  }

  // ─── Categories ───────────────────────────────────────────────────────────────

  async findCategories(): Promise<CatalogCategoryEntity[]> {
    const rows = await prisma.catalogCategory.findMany({
      orderBy: { name: 'asc' },
      include: { children: true },
    })
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      parentId: r.parentId ?? null,
      children: r.children.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parentId: c.parentId ?? null,
      })),
    }))
  }

  async findCategoryById(id: string): Promise<CatalogCategoryEntity | null> {
    const row = await prisma.catalogCategory.findUnique({ where: { id } })
    if (!row) return null
    return { id: row.id, name: row.name, slug: row.slug, parentId: row.parentId ?? null }
  }
}

export const catalogRepository = new CatalogRepository()
