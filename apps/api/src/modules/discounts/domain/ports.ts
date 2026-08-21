import type { PrismaClient } from '@prisma/client'
import type {
  DiscountCodeEntity,
  DiscountReservationEntity,
  CreateDiscountData,
  UpdateDiscountData,
  ListDiscountsParams,
  PaginatedDiscounts,
} from './entities'

type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export interface IDiscountRepository {
  create(storeId: string, data: CreateDiscountData, currency: string): Promise<DiscountCodeEntity>
  findById(id: string, storeId: string): Promise<DiscountCodeEntity | null>
  findByCode(storeId: string, code: string): Promise<DiscountCodeEntity | null>
  findByStore(params: ListDiscountsParams): Promise<PaginatedDiscounts>
  update(id: string, storeId: string, data: UpdateDiscountData): Promise<DiscountCodeEntity>
  softDelete(id: string, storeId: string): Promise<void>
  // Atomic conditional increment — returns true if slot was reserved, false if maxUses reached
  tryReserve(id: string, tx: Tx): Promise<boolean>
  // Decrement usedCount by 1 (used on reservation release)
  releaseOne(id: string, tx: Tx): Promise<void>
}

export interface IDiscountReservationRepository {
  create(data: {
    discountCodeId: string
    storeId: string
    amount: number
  }, tx: Tx): Promise<DiscountReservationEntity>
  attachSession(id: string, stripeSessionId: string): Promise<void>
  findBySessionId(stripeSessionId: string): Promise<DiscountReservationEntity | null>
  markConsumed(id: string, tx: Tx): Promise<void>
  markReleased(stripeSessionId: string, tx: Tx): Promise<boolean>
  findOrphans(olderThan: Date): Promise<DiscountReservationEntity[]>
}
