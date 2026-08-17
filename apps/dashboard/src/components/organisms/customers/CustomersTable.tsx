import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomersListStore } from '../../../stores/customersList.store'
import { useCustomers } from '../../../hooks/useCustomers'
import { useAuth } from '../../../hooks/useAuth'
import { useDebounce } from '../../../hooks/useDebounce'
import { Button } from '../../atoms/Button'
import { RFMBadge } from '../../molecules/customers/RFMBadge'
import { PAGE_SIZE } from '../../../lib/customers.constants'

export function CustomersTable() {
  const navigate = useNavigate()
  const { store } = useAuth()
  const { searchInput, sortBy, segment, page, setPage } = useCustomersListStore()

  const search = useDebounce(searchInput, 300)

  const fmt = useMemo(
    () => new Intl.NumberFormat('ro-RO', { style: 'currency', currency: store?.currency ?? 'EUR', maximumFractionDigits: 0 }),
    [store?.currency]
  )

  const { data, isLoading } = useCustomers({ search: search || undefined, sortBy, page, limit: PAGE_SIZE })

  const filtered = useMemo(() => {
    if (!data?.data) return []
    if (segment === 'all') return data.data
    return data.data.filter((c) => c.rfm.segment === segment)
  }, [data?.data, segment])

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1
  const count = segment === 'all' ? data?.total : filtered.length

  return (
    <>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400 dark:text-gray-500">Se încarcă...</div>
        ) : !filtered.length ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-500 dark:text-gray-400">
            {search ? 'Niciun client găsit pentru această căutare.' : 'Niciun client în acest segment.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                      Client
                      {count !== undefined && (
                        <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full tabular-nums">
                          {count}
                        </span>
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Segment</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Comenzi</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">LTV</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Ultima comandă</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Înregistrat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((customer) => {
                  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ')
                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      <td className="px-4 py-3">
                        {name && <p className="font-medium text-gray-800 dark:text-gray-200">{name}</p>}
                        <p className="text-gray-500 dark:text-gray-400">{customer.email}</p>
                      </td>
                      <td className="px-4 py-3"><RFMBadge segment={customer.rfm.segment} /></td>
                      <td className="px-4 py-3 tabular-nums text-gray-700 dark:text-gray-300">{customer.orderCount}</td>
                      <td className="px-4 py-3 font-semibold tabular-nums text-gray-900 dark:text-gray-100">{fmt.format(customer.ltv)}</td>
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                        {customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleDateString('ro-RO') : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                        {new Date(customer.createdAt).toLocaleDateString('ro-RO')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>← Anterior</Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">{page} / {totalPages}</span>
          <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Următor →</Button>
        </div>
      )}
    </>
  )
}
