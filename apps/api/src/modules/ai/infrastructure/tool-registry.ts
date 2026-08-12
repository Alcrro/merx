import type { Tool } from '@merx/llm-provider'
import { analyticsTools, executeGetAnalyticsOverview, executeGetTopProducts } from './tools/analytics.tool'
import { inventoryTools, executeGetInventoryStatus } from './tools/inventory.tool'
import { ordersTools, executeGetRecentOrders, executeGetOrderDetails } from './tools/orders.tool'

type ToolExecutor = (storeId: string, args: Record<string, unknown>) => Promise<unknown>

const executors: Record<string, ToolExecutor> = {
  get_analytics_overview: executeGetAnalyticsOverview,
  get_top_products: executeGetTopProducts,
  get_inventory_status: executeGetInventoryStatus,
  get_recent_orders: executeGetRecentOrders,
  get_order_details: executeGetOrderDetails,
}

export const allTools: Tool[] = [...analyticsTools, ...inventoryTools, ...ordersTools]

export async function executeTool(
  name: string,
  storeId: string,
  args: Record<string, unknown>
): Promise<string> {
  const executor = executors[name]
  if (!executor) return JSON.stringify({ error: `Unknown tool: ${name}` })
  try {
    const result = await executor(storeId, args)
    return JSON.stringify(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Tool execution failed'
    return JSON.stringify({ error: message })
  }
}
