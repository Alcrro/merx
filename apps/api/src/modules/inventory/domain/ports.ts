import type {
  InventoryItemEntity,
  InventoryMovementEntity,
  MovementType,
  ListInventoryParams,
  PaginatedInventory,
  StoreInventoryEntity,
  PaginatedStoreInventory,
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
  applyDelta(variantId: string, storeId: string, delta: number, type: MovementType, note?: string): Promise<InventoryItemEntity>
  updateReorderPoint(variantId: string, storeId: string, reorderPoint: number): Promise<InventoryItemEntity>
  listMovements(variantId: string, storeId: string, limit: number): Promise<InventoryMovementEntity[]>
  reserve(variantId: string, storeId: string, qty: number): Promise<void>
  release(variantId: string, storeId: string, qty: number): Promise<void>
  listStore(storeId: string, page: number, limit: number): Promise<PaginatedStoreInventory>
  upsertStock(storeId: string, storeProductVariantId: string, type: 'in' | 'out' | 'adjustment', qty: number): Promise<StoreInventoryEntity>
  setVariantStatus(storeId: string, storeProductVariantId: string, isActive: boolean): Promise<StoreInventoryEntity>
}

export type { StoreInventoryEntity, PaginatedStoreInventory }
