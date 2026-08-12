import type { IStoreRepository } from '../domain/ports'
import type { StoreEntity, UpdateStoreData } from '../domain/entities'
import { prisma } from '../../../lib/prisma'

export class StoreRepository implements IStoreRepository {
  async findById(id: string): Promise<StoreEntity | null> {
    const store = await prisma.store.findUnique({ where: { id } })
    if (!store) return null
    return { ...store, settings: store.settings as Record<string, unknown> }
  }

  async update(id: string, data: UpdateStoreData): Promise<StoreEntity> {
    const store = await prisma.store.update({ where: { id }, data })
    return { ...store, settings: store.settings as Record<string, unknown> }
  }
}
