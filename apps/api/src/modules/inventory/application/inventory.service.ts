import { prisma } from '../../../lib/prisma'
import type { IInventoryRepository, AdjustInventoryData } from '../domain/ports'
import type {
  InventoryItemEntity,
  InventoryMovementEntity,
  ListInventoryParams,
  PaginatedInventory,
} from '../domain/entities'

export class InventoryError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'CONFLICT' | 'INVALID'
  ) {
    super(message)
    this.name = 'InventoryError'
  }
}

export class InventoryService {
  constructor(private readonly repo: IInventoryRepository) {}

  async list(params: ListInventoryParams): Promise<PaginatedInventory> {
    // Lazily create inventory items for any variants that don't have one yet
    const untracked = await prisma.productVariant.findMany({
      where: { product: { storeId: params.storeId }, inventoryItem: null },
      select: { id: true },
    })
    if (untracked.length > 0) {
      await prisma.inventoryItem.createMany({
        data: untracked.map((v) => ({ variantId: v.id, storeId: params.storeId, quantity: 0 })),
        skipDuplicates: true,
      })
    }
    return this.repo.list(params)
  }

  async get(variantId: string, storeId: string): Promise<InventoryItemEntity> {
    const item = await this.repo.findByVariantId(variantId, storeId)
    if (!item) throw new InventoryError('Inventory item not found', 'NOT_FOUND')
    return item
  }

  async adjust(variantId: string, storeId: string, data: AdjustInventoryData): Promise<InventoryItemEntity> {
    const item = await this.repo.findByVariantId(variantId, storeId)
    if (!item) throw new InventoryError('Inventory item not found', 'NOT_FOUND')

    let delta: number
    if (data.type === 'in') {
      if (data.quantity <= 0) throw new InventoryError('Quantity must be positive', 'INVALID')
      delta = data.quantity
    } else if (data.type === 'out') {
      if (data.quantity <= 0) throw new InventoryError('Quantity must be positive', 'INVALID')
      delta = -data.quantity
    } else {
      // adjustment: data.quantity is the target total
      if (data.quantity < 0) throw new InventoryError('Target quantity cannot be negative', 'INVALID')
      delta = data.quantity - item.quantity
    }

    const newQuantity = item.quantity + delta
    if (newQuantity < 0) {
      throw new InventoryError('Stock cannot go below 0', 'INVALID')
    }
    if (newQuantity < item.reservedQuantity) {
      throw new InventoryError(`Stock cannot go below reserved quantity (${item.reservedQuantity})`, 'CONFLICT')
    }

    return this.repo.applyDelta(variantId, storeId, delta, data.type, data.note)
  }

  async updateReorderPoint(variantId: string, storeId: string, reorderPoint: number): Promise<InventoryItemEntity> {
    const item = await this.repo.findByVariantId(variantId, storeId)
    if (!item) throw new InventoryError('Inventory item not found', 'NOT_FOUND')
    if (reorderPoint < 0) throw new InventoryError('Reorder point cannot be negative', 'INVALID')
    return this.repo.updateReorderPoint(variantId, storeId, reorderPoint)
  }

  async listMovements(variantId: string, storeId: string): Promise<InventoryMovementEntity[]> {
    const item = await this.repo.findByVariantId(variantId, storeId)
    if (!item) throw new InventoryError('Inventory item not found', 'NOT_FOUND')
    return this.repo.listMovements(variantId, storeId, 50)
  }

  reserve(variantId: string, storeId: string, qty: number): Promise<void> {
    return this.repo.reserve(variantId, storeId, qty)
  }

  release(variantId: string, storeId: string, qty: number): Promise<void> {
    return this.repo.release(variantId, storeId, qty)
  }
}
