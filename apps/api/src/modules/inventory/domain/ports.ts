import type {
  InventoryItemEntity,
  InventoryMovementEntity,
  MovementType,
  ListInventoryParams,
  PaginatedInventory,
} from './entities'

export interface AdjustInventoryData {
  // 'in' = add qty, 'out' = remove qty, 'adjustment' = set to exact qty
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  note?: string
}

export interface IInventoryRepository {
  list(params: ListInventoryParams): Promise<PaginatedInventory>
  findByVariantId(variantId: string, storeId: string): Promise<InventoryItemEntity | null>
  // delta: signed number applied to quantity (+add, -remove)
  applyDelta(variantId: string, storeId: string, delta: number, type: MovementType, note?: string): Promise<InventoryItemEntity>
  updateReorderPoint(variantId: string, storeId: string, reorderPoint: number): Promise<InventoryItemEntity>
  listMovements(variantId: string, storeId: string, limit: number): Promise<InventoryMovementEntity[]>
  // atomic: increases reservedQuantity — throws if insufficient available stock
  reserve(variantId: string, storeId: string, qty: number): Promise<void>
  // atomic: decreases both reservedQuantity and quantity (on fulfillment)
  release(variantId: string, storeId: string, qty: number): Promise<void>
}
