import { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { storefrontApi } from '../lib/api'
import { useCart } from '../contexts/CartContext'
import { useStoreSlug } from '../contexts/StoreSlugContext'

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)
}

export function OrderConfirmationPage() {
  const storeSlug = useStoreSlug()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id') ?? ''
  const { clear } = useCart()

  const { data, isLoading, error } = useQuery({
    queryKey: ['order-confirmation', sessionId],
    queryFn: () => storefrontApi.getOrderConfirmation(storeSlug, sessionId),
    enabled: Boolean(sessionId),
    retry: false,
  })

  useEffect(() => {
    if (data?.status === 'paid') {
      clear()
    }
  }, [data?.status, clear])

  if (!sessionId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-gray-500">No order found.</p>
        <Link to="/" className="mt-4 inline-block text-sm underline text-gray-900">
          Go to store
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
        <p className="mt-4 text-gray-500">Loading your order…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-red-600">Could not load order details.</p>
        <Link to="/" className="mt-4 inline-block text-sm underline text-gray-900">
          Go to store
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-24 text-center">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank you!</h1>
      <p className="text-gray-500 mb-8">
        Your order has been placed. A confirmation will be sent to{' '}
        <strong>{data.customerEmail}</strong>.
      </p>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-left mb-8">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total paid</span>
          <span className="font-semibold text-gray-900">
            {formatPrice(data.amountTotal, data.currency)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>Payment status</span>
          <span className="capitalize font-medium text-green-600">{data.status}</span>
        </div>
      </div>

      <Link to="/products">
        <span className="inline-flex items-center gap-2 rounded bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700 transition-colors">
          Continue shopping
        </span>
      </Link>
    </div>
  )
}
