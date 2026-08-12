import type { StoreEntity, UpdateStoreData } from './entities'

export interface IStoreRepository {
  findById(id: string): Promise<StoreEntity | null>
  update(id: string, data: UpdateStoreData): Promise<StoreEntity>
}
