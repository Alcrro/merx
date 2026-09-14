import { Link } from 'react-router-dom'
import type { Order } from '@merx/types'
import { Spinner } from '../../atoms/Spinner'
import EmptyState from '../../atoms/EmptyState'
import OrdersTableBody from '../../molecules/orders/OrdersTableBody'

interface RecentOrdersTableProps {
  orders?: Order[]
  isLoading: boolean
}

function RecentOrdersTable({ orders, isLoading }: RecentOrdersTableProps) {
  const items = orders ?? []

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <p className="text-sm font-semibold text-fg-secondary">Comenzi recente</p>
        <Link to="/orders" className="text-xs text-brand hover:underline">
          Vezi toate
        </Link>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner className="h-5 w-5" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState message="Nicio comandă încă." />
      ) : (
        <OrdersTableBody orders={items} />
      )}
    </div>
  )
}

export default RecentOrdersTable
