import { useNavigate } from 'react-router-dom'
import type { Order } from '@merx/types'
import { orderSlug } from '../../../lib/orderSlug'
import { formatMoney, formatRelativeDate } from '../../../lib/format'
import { getOrderInitials, getOrderCustomerLabel, getOrderProductsLabel } from '../../../lib/orders'
import OrderStatusBadge from './OrderStatusBadge'

interface OrdersTableBodyProps {
  orders: Order[]
}

function OrdersTableBody({ orders }: OrdersTableBodyProps) {
  const navigate = useNavigate()

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border-subtle bg-gray-50/80 dark:bg-gray-800/40 text-left">
          <th className="px-5 py-3.5 table-header w-16">#</th>
          <th className="px-4 py-3.5 table-header">Client</th>
          <th className="px-4 py-3.5 table-header">Produse</th>
          <th className="px-4 py-3.5 table-header text-right">Total</th>
          <th className="px-4 py-3.5 table-header">Status</th>
          <th className="px-5 py-3.5 table-header text-right">Dată</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-subtle">
        {orders.map((order) => (
          <tr
            key={order.id}
            className="cursor-pointer hover:bg-surface-hover transition-colors"
            onClick={() => navigate(`/orders/${orderSlug(order.orderNumber, order.createdAt)}`)}
          >
            <td className="px-5 py-4">
              <span className="font-mono text-xs font-semibold text-fg-muted">
                #{order.orderNumber}
              </span>
            </td>
            <td className="px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-subtle flex items-center justify-center">
                  <span className="text-xs font-semibold text-brand">
                    {getOrderInitials(order)}
                  </span>
                </div>
                <span className="font-medium text-fg-primary truncate max-w-44">
                  {getOrderCustomerLabel(order)}
                </span>
              </div>
            </td>
            <td className="px-4 py-4">
              <span className="text-fg-secondary truncate max-w-56 block">
                {getOrderProductsLabel(order)}
              </span>
            </td>
            <td className="px-4 py-4 text-right">
              <span className="font-semibold tabular-nums text-fg-primary">
                {formatMoney(order.total, order.currency)}
              </span>
            </td>
            <td className="px-4 py-4">
              <OrderStatusBadge status={order.status} />
            </td>
            <td className="px-5 py-4 text-right">
              <span className="text-xs text-fg-muted tabular-nums">
                {formatRelativeDate(order.createdAt)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default OrdersTableBody
