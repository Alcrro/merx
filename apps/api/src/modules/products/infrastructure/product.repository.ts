import type { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import type {
  IProductRepository,
  CreateProductData,
  UpdateProductData,
  CreateVariantData,
  UpdateVariantData,
  CreateCategoryData,
  CreateBrandData,
  UpdateBrandData,
  CreateTagData,
} from '../domain/ports'
import type {
  ProductEntity,
  ProductVariantEntity,
  ProductCategoryEntity,
  BrandEntity,
  TagEntity,
  ListProductsParams,
  PaginatedProducts,
} from '../domain/entities'

function toVariant(v: Prisma.ProductVariantGetPayload<object>): ProductVariantEntity {
  return {
    ...v,
    price: Number(v.price),
    compareAtPrice: v.compareAtPrice !== null ? Number(v.compareAtPrice) : null,
    cost: v.cost !== null ? Number(v.cost) : null,
    weight: v.weight !== null ? Number(v.weight) : null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProduct(p: any): ProductEntity {
  return {
    id: p.id,
    storeId: p.storeId,
    categoryId: p.categoryId ?? null,
    brandId: p.brandId ?? null,
    title: p.title,
    description: p.description ?? null,
    status: p.status as ProductEntity['status'],
    productType: p.productType ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    variants: p.variants?.map(toVariant) ?? [],
    category: p.category ?? null,
    brand: p.brand ?? null,
    tags: p.tags ?? [],
  }
}

export class ProductRepository implements IProductRepository {
  async list(params: ListProductsParams): Promise<PaginatedProducts> {
    const { storeId, status, categoryId, page, limit } = params
    const where: Prisma.ProductWhereInput = {
      storeId,
      ...(status && { status }),
      ...(categoryId && { categoryId }),
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { variants: true, category: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return { data: data.map(toProduct), total, page, limit }
  }

  async findById(id: string, storeId: string): Promise<ProductEntity | null> {
    const p = await prisma.product.findFirst({
      where: { id, storeId },
      include: { variants: true, category: true },
    })
    if (!p) return null
    return toProduct(p)
  }

  async create(storeId: string, data: CreateProductData): Promise<ProductEntity> {
    const { tagIds, ...rest } = data
    const p = await prisma.product.create({
      data: {
        storeId,
        ...rest,
        ...(tagIds?.length && { tags: { connect: tagIds.map((id) => ({ id })) } }),
      },
      include: { variants: true, category: true },
    })
    return toProduct(p)
  }

  async update(id: string, _storeId: string, data: UpdateProductData): Promise<ProductEntity> {
    const { tagIds, ...rest } = data
    const p = await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(tagIds !== undefined && { tags: { set: tagIds.map((tid) => ({ id: tid })) } }),
      },
      include: { variants: true, category: true },
    })
    return toProduct(p)
  }

  async delete(id: string, _storeId: string): Promise<void> {
    await prisma.product.delete({ where: { id } })
  }

  async hasActiveOrders(productId: string): Promise<boolean> {
    const count = await prisma.orderItem.count({
      where: { variant: { productId } },
    })
    return count > 0
  }

  async createVariant(productId: string, storeId: string, data: CreateVariantData): Promise<ProductVariantEntity> {
    const v = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({ data: { productId, ...data } })
      await tx.inventoryItem.create({ data: { variantId: variant.id, storeId, quantity: 0 } })
      return variant
    })
    return toVariant(v)
  }

  async updateVariant(variantId: string, _productId: string, _storeId: string, data: UpdateVariantData): Promise<ProductVariantEntity> {
    const v = await prisma.productVariant.update({ where: { id: variantId }, data })
    return toVariant(v)
  }

  async deleteVariant(variantId: string, _productId: string, _storeId: string): Promise<void> {
    await prisma.productVariant.delete({ where: { id: variantId } })
  }

  async countVariants(productId: string): Promise<number> {
    return prisma.productVariant.count({ where: { productId } })
  }

  // ─── Categories ──────────────────────────────────────────────────────────────

  async listCategories(storeId: string): Promise<ProductCategoryEntity[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (prisma.productCategory as any).findMany({
      where: { storeId },
      orderBy: { name: 'asc' },
    })
    return rows.map((r: any) => ({ ...r, parentId: r.parentId ?? null })) // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  async createCategory(storeId: string, data: CreateCategoryData): Promise<ProductCategoryEntity> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = await (prisma.productCategory as any).create({
      data: { storeId, name: data.name, slug: data.slug, parentId: data.parentId ?? null },
    })
    return { ...row, parentId: row.parentId ?? null }
  }

  async deleteCategory(id: string, _storeId: string): Promise<void> {
    await prisma.productCategory.delete({ where: { id } })
  }

  // ─── Brands ──────────────────────────────────────────────────────────────────

  async listBrands(storeId: string): Promise<BrandEntity[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (prisma as any).brand.findMany({ where: { storeId }, orderBy: { name: 'asc' } })
  }

  async createBrand(storeId: string, data: CreateBrandData): Promise<BrandEntity> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (prisma as any).brand.create({ data: { storeId, ...data } })
  }

  async updateBrand(id: string, _storeId: string, data: UpdateBrandData): Promise<BrandEntity> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (prisma as any).brand.update({ where: { id }, data })
  }

  async deleteBrand(id: string, _storeId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).brand.delete({ where: { id } })
  }

  // ─── Tags ────────────────────────────────────────────────────────────────────

  async listTags(storeId: string, type?: string): Promise<TagEntity[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (prisma as any).tag.findMany({
      where: { storeId, ...(type && { type }) },
      orderBy: { name: 'asc' },
    })
  }

  async createTag(storeId: string, data: CreateTagData): Promise<TagEntity> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (prisma as any).tag.create({ data: { storeId, ...data } })
  }

  async deleteTag(id: string, _storeId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).tag.delete({ where: { id } })
  }
}
