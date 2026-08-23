import { prisma } from '../../../lib/prisma'
import type { IDiscountRepository } from '../domain/ports'
import type {
  DiscountCodeEntity,
  CreateDiscountData,
  UpdateDiscountData,
  ListDiscountsParams,
  PaginatedDiscounts,
} from '../domain/entities'
import type { PrismaClient } from '@prisma/client'

type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

function mapCode(row: {
  id: string
  storeId: string
  code: string
  type: string
  value: { toNumber(): number }
  currency: string
  minOrderAmount: { toNumber(): number } | null
  maxUses: number | null
  usedCount: number
  startsAt: Date | null
  expiresAt: Date | null
  isActive: boolean
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}): DiscountCodeEntity {
  return {
    ...row,
    type: row.type as DiscountCodeEntity['type'],
    value: row.value.toNumber(),
    minOrderAmount: row.minOrderAmount ? row.minOrderAmount.toNumber() : null,
  }
}

export class DiscountRepository implements IDiscountRepository {
  async create(storeId: string, data: CreateDiscountData, currency: string): Promise<DiscountCodeEntity> {
    const row = await prisma.discountCode.create({
      data: {
        storeId,
        code: data.code,
        type: data.type,
        value: data.value,
        currency,
        minOrderAmount: data.minOrderAmount ?? null,
        maxUses: data.maxUses ?? null,
        startsAt: data.startsAt ?? null,
        expiresAt: data.expiresAt ?? null,
        isActive: data.isActive ?? true,
      },
    })
    return mapCode(row)
  }

  async findById(id: string, storeId: string): Promise<DiscountCodeEntity | null> {
    const row = await prisma.discountCode.findFirst({
      where: { id, storeId, deletedAt: null },
    })
    return row ? mapCode(row) : null
  }

  // Partial-index on (store_id, code) WHERE deleted_at IS NULL backs this query
  async findByCode(storeId: string, code: string): Promise<DiscountCodeEntity | null> {
    const row = await prisma.discountCode.findFirst({
      where: { storeId, code, deletedAt: null },
    })
    return row ? mapCode(row) : null
  }

  async findByStore(params: ListDiscountsParams): Promise<PaginatedDiscounts> {
    const { storeId, isActive, search, page, limit } = params
    const where = {
      storeId,
      deletedAt: null,
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search ? { code: { contains: search.toUpperCase() } } : {}),
    }
    const [rows, total] = await Promise.all([
      prisma.discountCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.discountCode.count({ where }),
    ])
    return { data: rows.map(mapCode), total, page, limit }
  }

  async update(id: string, storeId: string, data: UpdateDiscountData): Promise<DiscountCodeEntity> {
    const row = await prisma.discountCode.update({
      where: { id },
      data: {
        ...(data.value !== undefined ? { value: data.value } : {}),
        ...(data.minOrderAmount !== undefined ? { minOrderAmount: data.minOrderAmount } : {}),
        ...(data.maxUses !== undefined ? { maxUses: data.maxUses } : {}),
        ...(data.startsAt !== undefined ? { startsAt: data.startsAt } : {}),
        ...(data.expiresAt !== undefined ? { expiresAt: data.expiresAt } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    })
    return mapCode(row)
  }

  async softDelete(id: string, storeId: string): Promise<void> {
    await prisma.discountCode.updateMany({
      where: { id, storeId, deletedAt: null },
      data: { deletedAt: new Date() },
    })
  }

  // Single UPDATE ... WHERE — atomic, no TOCTOU race
  async tryReserve(id: string, tx: Tx): Promise<boolean> {
    const result = await tx.$executeRaw`
      UPDATE discount_codes
      SET used_count = used_count + 1
      WHERE id = ${id}
        AND deleted_at IS NULL
        AND is_active = true
        AND (max_uses IS NULL OR used_count < max_uses)
    `
    return result === 1
  }

  async releaseOne(id: string, tx: Tx): Promise<void> {
    await tx.$executeRaw`
      UPDATE discount_codes
      SET used_count = GREATEST(used_count - 1, 0)
      WHERE id = ${id}
    `
  }
}

export const discountRepository = new DiscountRepository()
