import type { AuthStore } from '../types'

export interface IStoreRepository {
  findStoreByOwnerId(ownerId: string): Promise<AuthStore | null>
  createStore(data: { ownerId: string; name: string; slug: string }): Promise<AuthStore>
}
