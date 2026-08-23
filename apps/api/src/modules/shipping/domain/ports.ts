import type { ShippingMethod } from './entities'

export interface CreateShippingMethodData {
  name: string
  description?: string | null
  price: number
  isFree: boolean
  minOrderForFree?: number | null
  countries: string[]
  isActive: boolean
  position: number
}

export interface UpdateShippingMethodData {
  name?: string
  description?: string | null
  price?: number
  isFree?: boolean
  minOrderForFree?: number | null
  countries?: string[]
  isActive?: boolean
  position?: number
}

export interface IShippingRepository {
  create(storeId: string, data: CreateShippingMethodData): Promise<ShippingMethod>
  findById(id: string, storeId: string): Promise<ShippingMethod | null>
  findByStore(storeId: string): Promise<ShippingMethod[]>
  findActiveByStore(storeId: string): Promise<ShippingMethod[]>
  update(id: string, storeId: string, data: UpdateShippingMethodData): Promise<ShippingMethod>
  delete(id: string, storeId: string): Promise<void>
  updatePositions(updates: { id: string; position: number }[]): Promise<void>
  countByStore(storeId: string): Promise<number>
}
