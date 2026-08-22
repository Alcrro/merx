import { prisma } from '../../../../lib/prisma'
import type { ICatalogVariantRepository, CreateCatalogVariantData } from '../../domain/ports'
import type { CatalogVariantEntity } from '../../domain/entities'
import { toVariant } from './mappers/catalog.mapper'

export class CatalogVariantRepository implements ICatalogVariantRepository {
  async createVariant(catalogProductId: string, data: CreateCatalogVariantData): Promise<CatalogVariantEntity> {
    const v = await prisma.catalogVariant.create({ data: { catalogProductId, ...data } })
    return toVariant(v)
  }

  async findVariant(variantId: string, catalogProductId: string): Promise<{ id: string } | null> {
    return prisma.catalogVariant.findFirst({
      where: { id: variantId, catalogProductId },
      select: { id: true },
    })
  }
}

export const catalogVariantRepository = new CatalogVariantRepository()
