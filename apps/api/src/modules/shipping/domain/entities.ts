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
  createdAt: Date
  updatedAt: Date
}

export interface ShippingMethodWithPrice extends ShippingMethod {
  effectivePrice: number
}

export function calculateEffectivePrice(method: ShippingMethod, subtotal: number): number {
  if (method.isFree) return 0
  if (method.minOrderForFree !== null && subtotal >= method.minOrderForFree) return 0
  return method.price
}
