import { useNavigate } from 'react-router-dom'
import type { CustomerOrder } from '@merx/types'
import { orderSlug } from '../../../lib/orderSlug'
import OrderStatusBadge from '../../molecules/orders/OrderStatusBadge'
import PaymentStatusBadge from '../../molecules/orders/PaymentStatusBadge'
import FulfillmentStatusBadge from '../../molecules/orders/FulfillmentStatusBadge'

interface Props {
  orders: CustomerOrder[]
  fmt: Intl.NumberFormat
}

export function CustomerOrdersTable({ orders, fmt }: Props) {
  const navigate = useNavigate()

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Comenzi ({orders.length})</h2>
      </div>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-400 dark:text-gray-500">
          Nicio comandă.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">#</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Produse</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Plată</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Expediere</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Total</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Dată</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => navigate(`/orders/${orderSlug(order.orderNumber, order.createdAt)}`)}
                >
                  <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">#{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{order.items.length}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3"><PaymentStatusBadge status={order.paymentStatus} /></td>
                  <td className="px-4 py-3"><FulfillmentStatusBadge status={order.fulfillmentStatus} /></td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                    {fmt.format(order.total)}
                  </td>
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('ro-RO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
