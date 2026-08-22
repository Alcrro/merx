import { prisma } from '../../../../lib/prisma'
import type { IModerationRepository } from '../../domain/ports'
import type { CatalogProductStatus } from '../../domain/types'

export class ModerationRepository implements IModerationRepository {
  async findProduct(catalogProductId: string): Promise<{ title: string; description: string | null } | null> {
    const row = await prisma.catalogProduct.findUnique({
      where: { id: catalogProductId },
      select: { title: true, description: true },
    })
    return row ?? null
  }

  async updateStatus(catalogProductId: string, status: CatalogProductStatus): Promise<void> {
    await prisma.catalogProduct.update({
      where: { id: catalogProductId },
      data: { status },
    })
  }
}

export const moderationRepository = new ModerationRepository()
