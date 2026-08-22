import { prisma } from '../../../../lib/prisma'
import type { ICatalogCategoryRepository } from '../../domain/ports'
import type { CatalogCategoryEntity } from '../../domain/entities'

export class CatalogCategoryRepository implements ICatalogCategoryRepository {
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

export const catalogCategoryRepository = new CatalogCategoryRepository()
