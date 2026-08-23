import { CustomersFilters } from '../../components/organisms/customers/CustomersFilters'
import { CustomersTable } from '../../components/organisms/customers/CustomersTable'

export function CustomersListPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">Clienți</h1>
      <CustomersFilters />
      <CustomersTable />
    </div>
  )
}
