'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useStore } from '@/contexts/StoreContext'
import { storefrontApi, formatPrice, type OrderConfirmation } from '@/lib/api'
import { Button } from '@/components/atoms/Button'

export function OrderConfirmationContent() {
  const { slug } = useStore()
  const { clear } = useCart()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') ?? ''

  const [data, setData] = useState<OrderConfirmation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!sessionId) { setLoading(false); return }
    storefrontApi
      .getOrderConfirmation(slug, sessionId)
      .then((result) => {
        setData(result)
        if (result.status === 'paid') clear()
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, slug])

  if (!sessionId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-gray-500 mb-4">Nicio comandă găsită.</p>
        <Link href="/products"><Button variant="ghost">Mergi la produse</Button></Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
        <p className="text-sm text-gray-400">Se încarcă comanda...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-red-600 mb-4">Nu s-au putut încărca detaliile comenzii.</p>
        <Link href="/"><Button variant="ghost">Mergi la magazin</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-24 text-center">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mulțumim!</h1>
      <p className="text-gray-500 mb-8">
        Comanda a fost plasată. O confirmare va fi trimisă la{' '}
        <strong>{data.customerEmail}</strong>.
      </p>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-left mb-8 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total plătit</span>
          <span className="font-semibold text-gray-900">
            {formatPrice(data.amountTotal, data.currency)}
          </span>
        </div>
        {data.discountTotal != null && data.discountTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              Reducere {data.discountCodeSnapshot ? `(${data.discountCodeSnapshot})` : ''}
            </span>
            <span className="text-green-600 font-medium">
              − {formatPrice(data.discountTotal / 100, data.currency)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status plată</span>
          <span className="font-medium text-green-600 capitalize">{data.status}</span>
        </div>
      </div>

      <Link href="/products">
        <Button size="lg">Continuă cumpărăturile</Button>
      </Link>
    </div>
  )
}
