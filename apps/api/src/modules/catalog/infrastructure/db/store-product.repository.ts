import { prisma } from '../../../../lib/prisma'
import type { IStoreProductRepository } from '../../domain/ports'
import type { StoreProductEntity, StoreProductVariantEntity } from '../../domain/entities'
import { toStoreProduct, toStoreProductVariant } from './mappers/catalog.mapper'

const storeProductInclude = {
  catalogProduct: { include: { category: true, variants: true, _count: { select: { storeProducts: true } } } },
  variants: { include: { catalogVariant: true } },
}

export class StoreProductRepository implements IStoreProductRepository {
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
      include: storeProductInclude,
      orderBy: { addedAt: 'desc' },
    })
    return items.map(toStoreProduct)
  }

  async findStoreProduct(storeId: string, catalogProductId: string): Promise<StoreProductEntity | null> {
    const sp = await prisma.storeProduct.findUnique({
      where: { storeId_catalogProductId: { storeId, catalogProductId } },
      include: storeProductInclude,
    })
    return sp ? toStoreProduct(sp) : null
  }

  async findStoreProductById(storeProductId: string, storeId: string): Promise<StoreProductEntity | null> {
    const sp = await prisma.storeProduct.findFirst({
      where: { id: storeProductId, storeId },
      include: storeProductInclude,
    })
    return sp ? toStoreProduct(sp) : null
  }

  async updateStoreProduct(storeProductId: string, data: { shippingCost?: number }): Promise<StoreProductEntity> {
    const sp = await prisma.storeProduct.update({
      where: { id: storeProductId },
      data: data.shippingCost !== undefined ? { shippingCost: data.shippingCost } : {},
      include: storeProductInclude,
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
    await prisma.storeProductVariant.deleteMany({ where: { storeProductId, catalogVariantId } })
  }

  async updateStoreVariantPrice(
    storeProductId: string,
    catalogVariantId: string,
    customPrice: number | null,
  ): Promise<StoreProductVariantEntity> {
    const spv = await prisma.storeProductVariant.upsert({
      where: { storeProductId_catalogVariantId: { storeProductId, catalogVariantId } },
      update: { customPrice },
      create: { storeProductId, catalogVariantId, customPrice },
      include: { catalogVariant: true },
    })
    return toStoreProductVariant(spv)
  }
}

export const storeProductRepository = new StoreProductRepository()
