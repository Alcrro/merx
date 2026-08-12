import { prisma } from '../../../../lib/prisma'
import type { Tool } from '@merx/llm-provider'

export const inventoryTools: Tool[] = [
  {
    name: 'get_inventory_status',
    description:
      'Get inventory levels for all products. Returns items grouped by stock status: out_of_stock, critical (below reorder point), low (<=10), and ok. Use this to identify stock issues.',
    parameters: {
      type: 'object',
      properties: {
        status_filter: {
          type: 'string',
          enum: ['all', 'out_of_stock', 'critical', 'low', 'ok'],
          description: 'Filter by stock status. Defaults to all.',
        },
        limit: {
          type: 'number',
          description: 'Max items to return per status group. Defaults to 20.',
        },
      },
      required: [],
    },
  },
]

export async function executeGetInventoryStatus(
  storeId: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const statusFilter = typeof args.status_filter === 'string' ? args.status_filter : 'all'
  const limit = typeof args.limit === 'number' ? Math.min(args.limit, 100) : 20

  const items = await prisma.inventoryItem.findMany({
    where: { storeId },
    include: {
      variant: {
        select: {
          sku: true,
          title: true,
          product: { select: { title: true, status: true } },
        },
      },
    },
    orderBy: { quantity: 'asc' },
    take: limit * 4,
  })

  interface InventoryRow {
    variantId: string
    sku: string
    variantTitle: string
    productTitle: string
    productStatus: string
    quantity: number
    reservedQuantity: number
    reorderPoint: number
    availableQuantity: number
    status: 'out_of_stock' | 'critical' | 'low' | 'ok'
  }

  const rows: InventoryRow[] = items.map((item) => {
    const available = item.quantity - item.reservedQuantity
    let status: InventoryRow['status'] = 'ok'
    if (available <= 0) status = 'out_of_stock'
    else if (item.reorderPoint > 0 && available <= item.reorderPoint) status = 'critical'
    else if (available <= 10) status = 'low'

    return {
      variantId: item.variantId,
      sku: item.variant.sku,
      variantTitle: item.variant.title,
      productTitle: item.variant.product.title,
      productStatus: item.variant.product.status,
      quantity: item.quantity,
      reservedQuantity: item.reservedQuantity,
      reorderPoint: item.reorderPoint,
      availableQuantity: available,
      status,
    }
  })

  const grouped = {
    out_of_stock: rows.filter((r) => r.status === 'out_of_stock'),
    critical: rows.filter((r) => r.status === 'critical'),
    low: rows.filter((r) => r.status === 'low'),
    ok: rows.filter((r) => r.status === 'ok'),
  }

  if (statusFilter !== 'all') {
    const filtered = grouped[statusFilter as keyof typeof grouped] ?? []
    return {
      status_filter: statusFilter,
      count: filtered.length,
      items: filtered.slice(0, limit),
    }
  }

  return {
    summary: {
      out_of_stock: grouped.out_of_stock.length,
      critical: grouped.critical.length,
      low: grouped.low.length,
      ok: grouped.ok.length,
    },
    out_of_stock: grouped.out_of_stock.slice(0, limit),
    critical: grouped.critical.slice(0, limit),
    low: grouped.low.slice(0, limit),
  }
}
