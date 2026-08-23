import { shippingRepository } from '../infrastructure/shipping.repository'
import { calculateEffectivePrice } from '../domain/entities'
import type { ShippingMethod, ShippingMethodWithPrice } from '../domain/entities'
import type { CreateShippingMethodData, UpdateShippingMethodData } from '../domain/ports'

export class ShippingError extends Error {
  constructor(message: string, public readonly code: 'NOT_FOUND' | 'FORBIDDEN' | 'INVALID') {
    super(message)
    this.name = 'ShippingError'
  }
}

export class ShippingService {
  async getMethods(storeId: string): Promise<ShippingMethod[]> {
    return shippingRepository.findByStore(storeId)
  }

  async getActiveMethodsWithPrice(storeId: string, subtotal: number, country?: string): Promise<ShippingMethodWithPrice[]> {
    const methods = await shippingRepository.findActiveByStore(storeId)
    return methods
      .filter((m) => m.countries.length === 0 || (country && m.countries.includes(country.toUpperCase())))
      .map((m) => ({ ...m, effectivePrice: calculateEffectivePrice(m, subtotal) }))
  }

  async getMethodById(id: string, storeId: string): Promise<ShippingMethod> {
    const method = await shippingRepository.findById(id, storeId)
    if (!method) throw new ShippingError('Shipping method not found', 'NOT_FOUND')
    return method
  }

  async createMethod(storeId: string, data: CreateShippingMethodData): Promise<ShippingMethod> {
    const count = await shippingRepository.countByStore(storeId)
    return shippingRepository.create(storeId, { ...data, position: data.position ?? count })
  }

  async updateMethod(id: string, storeId: string, data: UpdateShippingMethodData): Promise<ShippingMethod> {
    const existing = await shippingRepository.findById(id, storeId)
    if (!existing) throw new ShippingError('Shipping method not found', 'NOT_FOUND')
    return shippingRepository.update(id, storeId, data)
  }

  async deleteMethod(id: string, storeId: string): Promise<void> {
    const existing = await shippingRepository.findById(id, storeId)
    if (!existing) throw new ShippingError('Shipping method not found', 'NOT_FOUND')
    await shippingRepository.delete(id, storeId)
  }

  async reorderMethods(storeId: string, ids: string[]): Promise<void> {
    const existing = await shippingRepository.findByStore(storeId)
    const existingIds = new Set(existing.map((m) => m.id))
    if (!ids.every((id) => existingIds.has(id))) {
      throw new ShippingError('One or more IDs do not belong to this store', 'INVALID')
    }
    await shippingRepository.updatePositions(ids.map((id, position) => ({ id, position })))
  }
}

export const shippingService = new ShippingService()
