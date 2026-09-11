import { Link } from 'react-router-dom'
import type { OrderCustomer } from '@merx/types'

interface OrderCustomerCardProps {
  customer: OrderCustomer
  initials: string
  customerName: string | null
}

function OrderCustomerCard({ customer, initials, customerName }: OrderCustomerCardProps) {
  return (
    <div className="card p-6">
      <p className="section-label">Client</p>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-brand-subtle flex items-center justify-center">
          <span className="text-sm font-semibold text-brand">{initials}</span>
        </div>
        <div className="min-w-0">
          {customerName && (
            <p className="font-medium text-fg-primary truncate">{customerName}</p>
          )}
          <Link
            to={`/customers/${customer.id}`}
            className="text-xs text-brand hover:underline truncate block"
            onClick={(e) => e.stopPropagation()}
          >
            {customer.email}
          </Link>
        </div>
      </div>
      <Link
        to={`/customers/${customer.id}`}
        className="flex items-center gap-1.5 text-xs font-medium text-fg-muted hover:text-brand transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
        Vezi profil client
      </Link>
    </div>
  )
}

export default OrderCustomerCard
