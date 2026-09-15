'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useStore } from '@/contexts/StoreContext'
import { CartItem } from '@/components/molecules/CartItem'
import { Button } from '@/components/atoms/Button'
import { storefrontApi, formatPrice, type DiscountValidationResult } from '@/lib/api'

export default function CartPage() {
  const { store, slug } = useStore()
  const { items, subtotal, clear } = useCart()
  const currency = store?.currency ?? 'EUR'

  const [code, setCode] = useState('')
  const [applied, setApplied] = useState<string | null>(null)
  const [validation, setValidation] = useState<DiscountValidationResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [discountError, setDiscountError] = useState<string | null>(null)

  const discountAmount = validation?.discount?.calculatedAmount ?? 0
  const total = Math.max(0, subtotal - discountAmount)

  async function handleApply() {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    setValidating(true)
    setDiscountError(null)
    try {
      const result = await storefrontApi.validateDiscount(slug, trimmed, subtotal)
      setValidation(result)
      if (result.valid) {
        setApplied(trimmed)
      } else {
        setDiscountError(result.reason ?? 'Cod invalid sau expirat')
        setApplied(null)
      }
    } catch {
      setDiscountError('Eroare la validare. Încearcă din nou.')
    } finally {
      setValidating(false)
    }
  }

  function handleRemove() {
    setCode('')
    setApplied(null)
    setValidation(null)
    setDiscountError(null)
  }

  const checkoutHref = applied ? `/checkout?discount=${encodeURIComponent(applied)}` : '/checkout'

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Coșul tău e gol</h2>
        <p className="text-sm text-gray-500 mb-8">Adaugă produse pentru a continua.</p>
        <Link href="/products">
          <Button>Explorează produsele</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Coșul tău</h1>
        <button
          onClick={clear}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          Golește coșul
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white px-6">
        {items.map((item) => (
          <CartItem key={item.variantId} item={item} currency={currency} />
        ))}
      </div>

      {/* Discount code */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Cod reducere</p>
        {applied ? (
          <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <div>
              <span className="text-sm font-mono font-semibold text-green-800">{applied}</span>
              {validation?.discount && (
                <p className="text-xs text-green-600 mt-0.5">
                  Economisești {formatPrice(validation.discount.calculatedAmount, currency)}
                </p>
              )}
            </div>
            <button
              onClick={handleRemove}
              className="text-xs text-green-700 hover:text-green-900 transition-colors"
            >
              Elimină
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setDiscountError(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              placeholder="Introdu codul..."
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm font-mono uppercase focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <Button
              variant="secondary"
              onClick={handleApply}
              disabled={!code.trim()}
              loading={validating}
            >
              Aplică
            </Button>
          </div>
        )}
        {discountError && (
          <p className="mt-2 text-xs text-red-600">{discountError}</p>
        )}
      </div>

      {/* Order summary */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal, currency)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Reducere ({applied})</span>
              <span>− {formatPrice(discountAmount, currency)}</span>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 pt-4 flex items-center justify-between font-semibold text-gray-900">
          <span>Total</span>
          <span className="text-lg">{formatPrice(total, currency)}</span>
        </div>
        <p className="mt-1 text-xs text-gray-400">Transport calculat la checkout.</p>

        <div className="mt-6 flex flex-col gap-3">
          <Link href={checkoutHref} className="block">
            <Button size="lg" className="w-full">
              Mergi la checkout →
            </Button>
          </Link>
          <Link href="/products" className="block">
            <Button variant="ghost" size="lg" className="w-full">
              Continuă cumpărăturile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
