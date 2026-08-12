export interface StoreEntity {
  id: string
  ownerId: string
  name: string
  slug: string
  currency: string
  locale: string
  timezone: string
  settings: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface UpdateStoreData {
  name?: string
  currency?: string
  locale?: string
  timezone?: string
}
