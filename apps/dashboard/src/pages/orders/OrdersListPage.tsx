import { OrdersTable } from '../../components/organisms/orders/OrdersTable'

export function OrdersListPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">Comenzi</h1>
      <OrdersTable />
    </div>
  )
}
