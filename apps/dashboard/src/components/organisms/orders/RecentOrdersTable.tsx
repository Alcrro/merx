import { Link } from 'react-router-dom'
import type { Order } from '@merx/types'
import { OrderStatusBadge } from '../../molecules/orders/OrderStatusBadge'

interface Props {
  orders?: Order[]
  fmt: Intl.NumberFormat
  isLoading: boolean
}

export function RecentOrdersTable({ orders, fmt, isLoading }: Props) {
  const items = orders ?? []

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Comenzi recente</p>
        <Link to="/orders" className="text-xs text-indigo-600 hover:underline">
          Vezi toate
        </Link>
      </div>
      {isLoading ? (
        <div className="h-48 animate-pulse bg-gray-50 dark:bg-gray-800" />
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-400 dark:text-gray-500">
          Nicio comandă încă.
        </div>
      ) : (
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {items.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-5 py-3">
                  <Link to={`/orders/${order.id}`} className="font-medium text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">
                    #{order.orderNumber}
                  </Link>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('ro-RO')}
                  </p>
                </td>
                <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-sm">
                  {order.customer
                    ? (`${order.customer.firstName ?? ''} ${order.customer.lastName ?? ''}`).trim() || order.customer.email
                    : '—'}
                </td>
                <td className="px-5 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-5 py-3 text-right font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                  {fmt.format(order.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
