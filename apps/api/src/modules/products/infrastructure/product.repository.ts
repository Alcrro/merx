import type { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import type { IProductRepository, CreateProductData, UpdateProductData, CreateVariantData, UpdateVariantData } from '../domain/ports'
import type { ProductEntity, ProductVariantEntity, ProductCategoryEntity, ListProductsParams, PaginatedProducts } from '../domain/entities'

function toVariant(v: Prisma.ProductVariantGetPayload<object>): ProductVariantEntity {
  return {
    ...v,
    price: Number(v.price),
    compareAtPrice: v.compareAtPrice !== null ? Number(v.compareAtPrice) : null,
    cost: v.cost !== null ? Number(v.cost) : null,
    weight: v.weight !== null ? Number(v.weight) : null,
  }
}

function toProduct(p: Prisma.ProductGetPayload<{ include: { variants: true; category: true } }>): ProductEntity {
  const { metadata: _m, ...rest } = p
  return {
    ...rest,
    status: p.status as ProductEntity['status'],
    variants: p.variants.map(toVariant),
    category: p.category ?? null,
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
    const p = await prisma.product.create({
      data: { storeId, ...data },
      include: { variants: true, category: true },
    })
    return toProduct(p)
  }

  async update(id: string, storeId: string, data: UpdateProductData): Promise<ProductEntity> {
    const p = await prisma.product.update({
      where: { id },
      data,
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

  async listCategories(storeId: string): Promise<ProductCategoryEntity[]> {
    return prisma.productCategory.findMany({
      where: { storeId },
      orderBy: { name: 'asc' },
    })
  }

  async createCategory(storeId: string, name: string, slug: string): Promise<ProductCategoryEntity> {
    return prisma.productCategory.create({ data: { storeId, name, slug } })
  }
}
