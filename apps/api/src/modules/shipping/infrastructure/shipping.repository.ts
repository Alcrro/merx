import { prisma } from '../../../lib/prisma'
import type { IShippingRepository, CreateShippingMethodData, UpdateShippingMethodData } from '../domain/ports'
import type { ShippingMethod } from '../domain/entities'

function toEntity(row: {
  id: string
  storeId: string
  name: string
  description: string | null
  price: { toNumber(): number }
  isFree: boolean
  minOrderForFree: { toNumber(): number } | null
  countries: string[]
  isActive: boolean
  position: number
  createdAt: Date
  updatedAt: Date
}): ShippingMethod {
  return {
    id: row.id,
    storeId: row.storeId,
    name: row.name,
    description: row.description,
    price: row.price.toNumber(),
    isFree: row.isFree,
    minOrderForFree: row.minOrderForFree ? row.minOrderForFree.toNumber() : null,
    countries: row.countries,
    isActive: row.isActive,
    position: row.position,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export class ShippingRepository implements IShippingRepository {
  async create(storeId: string, data: CreateShippingMethodData): Promise<ShippingMethod> {
    const row = await prisma.shippingMethod.create({
      data: {
        storeId,
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        isFree: data.isFree,
        minOrderForFree: data.minOrderForFree ?? null,
        countries: data.countries,
        isActive: data.isActive,
        position: data.position,
      },
    })
    return toEntity(row)
  }

  async findById(id: string, storeId: string): Promise<ShippingMethod | null> {
    const row = await prisma.shippingMethod.findFirst({ where: { id, storeId } })
    return row ? toEntity(row) : null
  }

  async findByStore(storeId: string): Promise<ShippingMethod[]> {
    const rows = await prisma.shippingMethod.findMany({
      where: { storeId },
      orderBy: { position: 'asc' },
    })
    return rows.map(toEntity)
  }

  async findActiveByStore(storeId: string): Promise<ShippingMethod[]> {
    const rows = await prisma.shippingMethod.findMany({
      where: { storeId, isActive: true },
      orderBy: { position: 'asc' },
    })
    return rows.map(toEntity)
  }

  async update(id: string, storeId: string, data: UpdateShippingMethodData): Promise<ShippingMethod> {
    const row = await prisma.shippingMethod.updateMany({
      where: { id, storeId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.isFree !== undefined && { isFree: data.isFree }),
        ...(data.minOrderForFree !== undefined && { minOrderForFree: data.minOrderForFree }),
        ...(data.countries !== undefined && { countries: data.countries }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.position !== undefined && { position: data.position }),
      },
    })
    if (row.count === 0) throw new Error('ShippingMethod not found')
    const updated = await prisma.shippingMethod.findFirst({ where: { id, storeId } })
    return toEntity(updated!)
  }

  async delete(id: string, storeId: string): Promise<void> {
    await prisma.shippingMethod.deleteMany({ where: { id, storeId } })
  }

  async updatePositions(updates: { id: string; position: number }[]): Promise<void> {
    await prisma.$transaction(
      updates.map(({ id, position }) =>
        prisma.shippingMethod.update({ where: { id }, data: { position } }),
      ),
    )
  }

  async countByStore(storeId: string): Promise<number> {
    return prisma.shippingMethod.count({ where: { storeId } })
  }
}

export const shippingRepository = new ShippingRepository()
