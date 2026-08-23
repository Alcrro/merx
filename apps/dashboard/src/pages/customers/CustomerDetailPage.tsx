import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCustomer, useCustomerAnalytics } from '../../hooks/useCustomers'
import { StatCard } from '../../components/atoms/StatCard'
import { CustomerRFMCard } from '../../components/molecules/customers/CustomerRFMCard'
import { CustomerAOVCard } from '../../components/molecules/customers/CustomerAOVCard'
import { CustomerCadenceCard } from '../../components/molecules/customers/CustomerCadenceCard'
import { CustomerTopProducts } from '../../components/molecules/customers/CustomerTopProducts'
import { CustomerSpendChart } from '../../components/organisms/customers/CustomerSpendChart'
import { CustomerOrdersTable } from '../../components/organisms/customers/CustomerOrdersTable'

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { store } = useAuth()
  const { data: customer, isLoading } = useCustomer(id ?? '')
  const { data: analytics, isLoading: analyticsLoading } = useCustomerAnalytics(id ?? '')

  const fmt = useMemo(
    () => new Intl.NumberFormat('ro-RO', { style: 'currency', currency: store?.currency ?? 'EUR', maximumFractionDigits: 0 }),
    [store?.currency]
  )

  if (isLoading) {
    return <div className="flex items-center justify-center py-32 text-sm text-gray-400 dark:text-gray-500">Se încarcă...</div>
  }

  if (!customer) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Clientul nu a fost găsit.</div>
  }

  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ')
  const firstOrderDate = customer.orders.length > 0
    ? new Date(customer.orders[customer.orders.length - 1].createdAt).toLocaleDateString('ro-RO')
    : '—'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          onClick={() => navigate('/customers')}
          className="mb-3 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition"
        >
          ← Clienți
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{name || customer.email}</h1>
        {name && <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">{customer.email}</p>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="LTV total" value={fmt.format(customer.ltv)} />
        <StatCard label="Comenzi" value={String(customer.orderCount)} />
        <StatCard label="Prima comandă" value={firstOrderDate} />
        <StatCard label="Ultima comandă" value={customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleDateString('ro-RO') : '—'} />
      </div>

      <CustomerRFMCard rfm={customer.rfm} />
      <CustomerSpendChart data={analytics?.monthlySpend} fmt={fmt} isLoading={analyticsLoading} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomerAOVCard analytics={analytics} isLoading={analyticsLoading} fmt={fmt} />
        <CustomerCadenceCard analytics={analytics} isLoading={analyticsLoading} />
      </div>

      <CustomerTopProducts analytics={analytics} isLoading={analyticsLoading} fmt={fmt} />
      <CustomerOrdersTable orders={customer.orders} fmt={fmt} />
    </div>
  )
}
