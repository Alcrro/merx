import { prisma } from '../../../lib/prisma'
import type { IThemeRepository } from '../domain/ports'
import type { ThemeVersion, CreateThemeVersionData } from '../domain/entities'
import { ThemeError } from '../domain/entities'
import { migrateThemeConfig, type ThemeConfig } from '../domain/theme.schema'
import type { ThemeVersion as PrismaThemeVersion } from '@prisma/client'

const VERSIONS_RETENTION = 20

function toEntity(row: PrismaThemeVersion): ThemeVersion {
  return {
    id: row.id,
    storeId: row.storeId,
    schemaVersion: row.schemaVersion,
    config: migrateThemeConfig(row.config as Record<string, unknown>),
    status: row.status as ThemeVersion['status'],
    createdBy: row.createdBy as ThemeVersion['createdBy'],
    label: row.label,
    hasA11yWarning: row.hasA11yWarning,
    createdAt: row.createdAt,
  }
}

class ThemeRepository implements IThemeRepository {
  async saveDraft(data: CreateThemeVersionData): Promise<ThemeVersion> {
    // Archive any existing draft for this store first
    await prisma.themeVersion.updateMany({
      where: { storeId: data.storeId, status: 'draft' },
      data: { status: 'archived' },
    })

    const row = await prisma.themeVersion.create({
      data: {
        storeId: data.storeId,
        config: data.config as object,
        status: 'draft',
        createdBy: data.createdBy,
        label: data.label ?? null,
      },
    })

    await this.pruneOldVersions(data.storeId)

    return toEntity(row)
  }

  async getDraft(storeId: string): Promise<ThemeVersion | null> {
    const row = await prisma.themeVersion.findFirst({
      where: { storeId, status: 'draft' },
      orderBy: { createdAt: 'desc' },
    })
    return row ? toEntity(row) : null
  }

  async getPublished(storeId: string): Promise<ThemeVersion | null> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { themePublishedId: true },
    })
    if (!store?.themePublishedId) return null

    const row = await prisma.themeVersion.findUnique({
      where: { id: store.themePublishedId },
    })
    return row ? toEntity(row) : null
  }

  async getById(storeId: string, versionId: string): Promise<ThemeVersion | null> {
    const row = await prisma.themeVersion.findFirst({
      where: { id: versionId, storeId },
    })
    return row ? toEntity(row) : null
  }

  async updateDraftConfig(versionId: string, config: ThemeConfig, hasA11yWarning: boolean): Promise<ThemeVersion> {
    const row = await prisma.themeVersion.update({
      where: { id: versionId },
      data: { config: config as object, hasA11yWarning },
    })
    return toEntity(row)
  }

  async publish(storeId: string, versionId: string, hasA11yWarning: boolean): Promise<ThemeVersion> {
    const [row] = await prisma.$transaction([
      prisma.themeVersion.update({
        where: { id: versionId },
        data: { status: 'published', hasA11yWarning },
      }),
      // Archive the previous published version if different
      prisma.themeVersion.updateMany({
        where: { storeId, status: 'published', id: { not: versionId } },
        data: { status: 'archived' },
      }),
      prisma.store.update({
        where: { id: storeId },
        data: { themePublishedId: versionId },
      }),
    ])

    return toEntity(row)
  }

  async rollback(storeId: string, versionId: string): Promise<ThemeVersion> {
    const target = await prisma.themeVersion.findFirst({
      where: { id: versionId, storeId },
    })
    if (!target) throw new ThemeError('Version not found', 'VERSION_NOT_FOUND')

    return this.publish(storeId, versionId, target.hasA11yWarning)
  }

  async listVersions(storeId: string): Promise<ThemeVersion[]> {
    const rows = await prisma.themeVersion.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: VERSIONS_RETENTION,
    })
    return rows.map(toEntity)
  }

  private async pruneOldVersions(storeId: string): Promise<void> {
    const rows = await prisma.themeVersion.findMany({
      where: { storeId, status: 'archived' },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })

    if (rows.length > VERSIONS_RETENTION) {
      const toDelete = rows.slice(VERSIONS_RETENTION).map((r) => r.id)
      await prisma.themeVersion.deleteMany({ where: { id: { in: toDelete } } })
    }
  }
}

export const themeRepository = new ThemeRepository()
