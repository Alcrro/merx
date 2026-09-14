import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAnalyticsOverview } from '../../hooks/useAnalytics'
import { useOrders } from '../../hooks/useOrders'
import { useInventory } from '../../hooks/useInventory'
import { OverviewCards } from '../../components/organisms/dashboard/OverviewCards'
import RecentOrdersTable from '../../components/organisms/orders/RecentOrdersTable'
import { LowStockAlerts } from '../../components/organisms/dashboard/LowStockAlerts'
import { AIInsightsWidget } from '../../components/organisms/dashboard/AIInsightsWidget'

export function DashboardPage() {
  const { user, store } = useAuth()

  if (!store) return <Navigate to="/intro" replace />
  const fmt = useMemo(
    () => new Intl.NumberFormat('ro-RO', { style: 'currency', currency: store?.currency ?? 'EUR', maximumFractionDigits: 0 }),
    [store?.currency]
  )

  const { data: overview, isLoading: loadingOverview } = useAnalyticsOverview(30)
  const { data: ordersData, isLoading: loadingOrders } = useOrders({ page: 1, limit: 5 })
  const { data: inventoryData, isLoading: loadingInventory } = useInventory({ page: 1, limit: 50 })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Bun venit, {user?.name ?? user?.email}
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Ultimele 30 de zile</p>
      </div>

      <OverviewCards data={overview} fmt={fmt} isLoading={loadingOverview} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={ordersData?.data} isLoading={loadingOrders} />
        </div>
        <div className="flex flex-col gap-6">
          <AIInsightsWidget />
          <LowStockAlerts items={inventoryData?.data} isLoading={loadingInventory} />
        </div>
      </div>
    </div>
  )
}
