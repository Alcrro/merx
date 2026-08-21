export interface StoreSettings {
  business?: {
    companyName?: string
    vatNumber?: string
    contactEmail?: string
    phone?: string
    address?: string
    city?: string
    country?: string
  }
  notifications?: {
    orderCreated?: boolean
    lowStock?: boolean
    orderDelivered?: boolean
  }
  shipping?: {
    flatRate?: number
    freeShippingThreshold?: number | null
  }
  tax?: {
    rate?: number
    includedInPrice?: boolean
  }
}

export interface StoreEntity {
  id: string
  ownerId: string
  name: string
  slug: string
  currency: string
  locale: string
  timezone: string
  settings: StoreSettings
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface UpdateStoreData {
  name?: string
  currency?: string
  locale?: string
  timezone?: string
  settings?: StoreSettings
}
