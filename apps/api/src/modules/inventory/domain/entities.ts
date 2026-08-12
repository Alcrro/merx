export type MovementType = 'in' | 'out' | 'adjustment' | 'reserve' | 'release'

export interface InventoryVariantInfo {
  id: string
  sku: string
  title: string
  price: number
  productId: string
  productTitle: string
}

export interface InventoryItemEntity {
  id: string
  variantId: string
  storeId: string
  quantity: number
  reservedQuantity: number
  reorderPoint: number
  availableQuantity: number
  updatedAt: Date
  variant: InventoryVariantInfo
}

export interface InventoryMovementEntity {
  id: string
  storeId: string
  variantId: string
  type: MovementType
  quantity: number
  note: string | null
  actorType: string
  createdAt: Date
}

export interface ListInventoryParams {
  storeId: string
  page: number
  limit: number
}

export interface PaginatedInventory {
  data: InventoryItemEntity[]
  total: number
  page: number
  limit: number
}
