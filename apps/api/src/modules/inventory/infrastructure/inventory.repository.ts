import type { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import type { IInventoryRepository } from '../domain/ports'
import type {
  InventoryItemEntity,
  InventoryMovementEntity,
  MovementType,
  ListInventoryParams,
  PaginatedInventory,
} from '../domain/entities'

type ItemWithVariant = Prisma.InventoryItemGetPayload<{
  include: {
    variant: {
      include: {
        product: { select: { id: true; title: true } }
      }
    }
  }
}>

const include = {
  variant: {
    include: {
      product: { select: { id: true, title: true } },
    },
  },
} satisfies Prisma.InventoryItemInclude

function toItem(i: ItemWithVariant): InventoryItemEntity {
  return {
    id: i.id,
    variantId: i.variantId,
    storeId: i.storeId,
    quantity: i.quantity,
    reservedQuantity: i.reservedQuantity,
    reorderPoint: i.reorderPoint,
    availableQuantity: i.quantity - i.reservedQuantity,
    updatedAt: i.updatedAt,
    variant: {
      id: i.variant.id,
      sku: i.variant.sku,
      title: i.variant.title,
      price: Number(i.variant.price),
      productId: i.variant.product.id,
      productTitle: i.variant.product.title,
    },
  }
}

function toMovement(m: Prisma.InventoryMovementGetPayload<object>): InventoryMovementEntity {
  return { ...m, type: m.type as MovementType }
}

export class InventoryRepository implements IInventoryRepository {
  async list(params: ListInventoryParams): Promise<PaginatedInventory> {
    const { storeId, page, limit } = params
    const where: Prisma.InventoryItemWhereInput = { storeId }

    const [data, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include,
        orderBy: { variant: { product: { title: 'asc' } } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inventoryItem.count({ where }),
    ])

    return { data: data.map(toItem), total, page, limit }
  }

  async findByVariantId(variantId: string, storeId: string): Promise<InventoryItemEntity | null> {
    const i = await prisma.inventoryItem.findFirst({ where: { variantId, storeId }, include })
    return i ? toItem(i) : null
  }

  async applyDelta(variantId: string, storeId: string, delta: number, type: MovementType, note?: string): Promise<InventoryItemEntity> {
    const [item] = await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { variantId },
        data: { quantity: { increment: delta } },
        include,
      }),
      prisma.inventoryMovement.create({
        data: { storeId, variantId, type, quantity: delta, note: note ?? null, actorType: 'user' },
      }),
    ])
    return toItem(item)
  }

  async updateReorderPoint(variantId: string, _storeId: string, reorderPoint: number): Promise<InventoryItemEntity> {
    const i = await prisma.inventoryItem.update({ where: { variantId }, data: { reorderPoint }, include })
    return toItem(i)
  }

  async listMovements(variantId: string, storeId: string, limit: number): Promise<InventoryMovementEntity[]> {
    const movements = await prisma.inventoryMovement.findMany({
      where: { variantId, storeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return movements.map(toMovement)
  }

  async reserve(variantId: string, storeId: string, qty: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({ where: { variantId } })
      if (item?.storeId !== storeId) throw new Error('Inventory item not found')
      if (item.quantity - item.reservedQuantity < qty) throw new Error('Insufficient available stock')

      await tx.inventoryItem.update({
        where: { variantId },
        data: { reservedQuantity: { increment: qty } },
      })
      await tx.inventoryMovement.create({
        data: { storeId, variantId, type: 'reserve', quantity: qty, actorType: 'system' },
      })
    })
  }

  async release(variantId: string, storeId: string, qty: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({ where: { variantId } })
      if (item?.storeId !== storeId) throw new Error('Inventory item not found')

      await tx.inventoryItem.update({
        where: { variantId },
        data: {
          quantity: { decrement: qty },
          reservedQuantity: { decrement: Math.min(qty, item.reservedQuantity) },
        },
      })
      await tx.inventoryMovement.create({
        data: { storeId, variantId, type: 'release', quantity: -qty, actorType: 'system' },
      })
    })
  }
}
