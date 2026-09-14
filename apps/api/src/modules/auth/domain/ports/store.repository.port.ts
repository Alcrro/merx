import type { AuthStore, AuthStoreWithMeta } from '../types'

export interface IStoreRepository {
  findStoreBySlug(slug: string): Promise<AuthStoreWithMeta | null>
  findStoresByOwnerId(ownerId: string): Promise<AuthStore[]>
}
