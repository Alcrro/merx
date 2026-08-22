import { prisma } from '../../../../lib/prisma'
import type { IAnalyticsRepository } from '../../domain/ports'
import type {
  AnalyticsOrder,
  CoProduct,
  CustomerLtvRow,
  StoreProductAnalyticsContext,
} from '../../domain/types'
import { toAnalyticsOrder } from './mappers/analytics.mapper'

export class AnalyticsRepository implements IAnalyticsRepository {
  async findStoreProductContext(storeProductId: string, storeId: string): Promise<StoreProductAnalyticsContext | null> {
    const sp = await prisma.storeProduct.findUnique({
      where: { id: storeProductId },
      include: {
        catalogProduct: true,
        variants: { include: { catalogVariant: true } },
      },
    })

    if (!sp || sp.storeId !== storeId) return null

    return {
      id: sp.id,
      storeId: sp.storeId,
      catalogProductId: sp.catalogProductId,
      catalogProductTitle: sp.catalogProduct?.title ?? '',
      variants: sp.variants.map((v) => ({
        catalogVariantId: v.catalogVariantId,
        customPrice: v.customPrice !== null ? Number(v.customPrice) : null,
        variantTitle: v.catalogVariant?.title ?? '',
        sku: v.catalogVariant?.sku ?? '',
        suggestedPrice: Number(v.catalogVariant?.suggestedPrice ?? 0),
      })),
    }
  }

  async findStoreProductVariantContext(storeProductId: string, storeId: string, catalogVariantId: string): Promise<StoreProductAnalyticsContext | null> {
    const sp = await prisma.storeProduct.findUnique({
      where: { id: storeProductId },
      include: {
        catalogProduct: true,
        variants: {
          where: { catalogVariantId },
          include: { catalogVariant: true },
        },
      },
    })

    if (!sp || sp.storeId !== storeId) return null

    return {
      id: sp.id,
      storeId: sp.storeId,
      catalogProductId: sp.catalogProductId,
      catalogProductTitle: sp.catalogProduct?.title ?? '',
      variants: sp.variants.map((v) => ({
        catalogVariantId: v.catalogVariantId,
        customPrice: v.customPrice !== null ? Number(v.customPrice) : null,
        variantTitle: v.catalogVariant?.title ?? '',
        sku: v.catalogVariant?.sku ?? '',
        suggestedPrice: Number(v.catalogVariant?.suggestedPrice ?? 0),
      })),
    }
  }

  async findOrdersByTitlePrefix(storeId: string, titlePrefix: string): Promise<AnalyticsOrder[]> {
    const orders = await prisma.order.findMany({
      where: {
        storeId,
        items: { some: { title: { startsWith: titlePrefix } } },
      },
      include: {
        items: { where: { title: { startsWith: titlePrefix } } },
      },
    })
    return orders.map(toAnalyticsOrder)
  }

  async findOrdersByExactTitle(storeId: string, exactTitle: string): Promise<AnalyticsOrder[]> {
    const orders = await prisma.order.findMany({
      where: {
        storeId,
        items: { some: { title: exactTitle } },
      },
      include: {
        items: { where: { title: exactTitle } },
      },
    })
    return orders.map(toAnalyticsOrder)
  }

  async findCustomerLtv(storeId: string, customerIds: string[]): Promise<CustomerLtvRow[]> {
    const rows = await prisma.order.groupBy({
      by: ['customerId'],
      where: { storeId, customerId: { in: customerIds }, paymentStatus: 'paid' },
      _sum: { total: true },
    })
    return rows
      .filter((r) => r.customerId !== null)
      .map((r) => ({ customerId: r.customerId!, ltv: Number(r._sum.total ?? 0) }))
  }

  async findCoProducts(storeId: string, excludeCatalogProductId: string): Promise<CoProduct[]> {
    const rows = await prisma.storeProduct.findMany({
      where: { storeId, NOT: { catalogProductId: excludeCatalogProductId } },
      include: { catalogProduct: { select: { id: true, title: true } } },
    })
    return rows
      .filter((r) => r.catalogProduct?.title)
      .map((r) => ({
        storeProductId: r.id,
        catalogProductId: r.catalogProductId,
        title: r.catalogProduct!.title,
      }))
  }

  async findOtherItemsInOrdersByPrefix(orderIds: string[], excludePrefix: string): Promise<{ title: string; orderId: string }[]> {
    return prisma.orderItem.findMany({
      where: {
        orderId: { in: orderIds },
        NOT: { title: { startsWith: excludePrefix } },
      },
      select: { title: true, orderId: true },
    })
  }

  async findOtherItemsInOrdersByTitle(orderIds: string[], excludeTitle: string): Promise<{ title: string; orderId: string }[]> {
    return prisma.orderItem.findMany({
      where: {
        orderId: { in: orderIds },
        NOT: { title: excludeTitle },
      },
      select: { title: true, orderId: true },
    })
  }
}

export const analyticsRepository = new AnalyticsRepository()
