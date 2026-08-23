import { apiClient } from './client'

export interface ShippingMethod {
  id: string
  storeId: string
  name: string
  description: string | null
  price: number
  isFree: boolean
  minOrderForFree: number | null
  countries: string[]
  isActive: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export interface CreateShippingMethodInput {
  name: string
  description?: string | null
  price: number
  isFree?: boolean
  minOrderForFree?: number | null
  countries?: string[]
  isActive?: boolean
  position?: number
}

export type UpdateShippingMethodInput = Partial<CreateShippingMethodInput>

export const shippingApi = {
  list: (): Promise<ShippingMethod[]> =>
    apiClient.get('/shipping-methods').then((r) => r.data),

  create: (data: CreateShippingMethodInput): Promise<ShippingMethod> =>
    apiClient.post('/shipping-methods', data).then((r) => r.data),

  update: (id: string, data: UpdateShippingMethodInput): Promise<ShippingMethod> =>
    apiClient.patch(`/shipping-methods/${id}`, data).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    apiClient.delete(`/shipping-methods/${id}`).then(() => undefined),

  reorder: (ids: string[]): Promise<{ ok: boolean }> =>
    apiClient.patch('/shipping-methods/reorder', { ids }).then((r) => r.data),
}
