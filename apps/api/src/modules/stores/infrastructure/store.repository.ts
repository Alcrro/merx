import type { IStoreRepository } from '../domain/ports'
import type { StoreEntity, UpdateStoreData, StoreSettings } from '../domain/entities'
import { prisma } from '../../../lib/prisma'

export class StoreRepository implements IStoreRepository {
  async findById(id: string): Promise<StoreEntity | null> {
    const store = await prisma.store.findUnique({ where: { id, deletedAt: null } })
    if (!store) return null
    return { ...store, settings: (store.settings ?? {}) as StoreSettings }
  }

  async update(id: string, data: UpdateStoreData): Promise<StoreEntity> {
    const { settings, ...rest } = data
    const store = await prisma.store.update({
      where: { id },
      data: { ...rest, ...(settings !== undefined ? { settings: settings as object } : {}) },
    })
    return { ...store, settings: (store.settings ?? {}) as StoreSettings }
  }

  async delete(id: string): Promise<void> {
    await prisma.store.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
