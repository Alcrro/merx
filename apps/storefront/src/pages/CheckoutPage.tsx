import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useStore } from '../hooks/useStore'
import { useStoreSlug } from '../contexts/StoreSlugContext'
import { storefrontApi } from '../lib/api'
import { Button } from '../components/atoms/Button'

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)
}

interface FormState {
  email: string
  firstName: string
  lastName: string
  line1: string
  line2: string
  city: string
  country: string
  postalCode: string
}

const INITIAL: FormState = {
  email: '',
  firstName: '',
  lastName: '',
  line1: '',
  line2: '',
  city: '',
  country: 'RO',
  postalCode: '',
}

export function CheckoutPage() {
  const storeSlug = useStoreSlug()
  const { data: store } = useStore(storeSlug)
  const { items, subtotal } = useCart()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currency = store?.currency ?? 'EUR'

  if (items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { url } = await storefrontApi.checkout(storeSlug, {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        shippingAddress: {
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          country: form.country,
          postalCode: form.postalCode,
        },
      })
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Contact
            </legend>
            <input
              type="email"
              required
              placeholder="Email address"
              value={form.email}
              onChange={set('email')}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Name
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="First name"
                value={form.firstName}
                onChange={set('firstName')}
                className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
              <input
                type="text"
                required
                placeholder="Last name"
                value={form.lastName}
                onChange={set('lastName')}
                className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Shipping address
            </legend>
            <input
              type="text"
              required
              placeholder="Street address"
              value={form.line1}
              onChange={set('line1')}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <input
              type="text"
              placeholder="Apartment, suite, etc. (optional)"
              value={form.line2}
              onChange={set('line2')}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="City"
                value={form.city}
                onChange={set('city')}
                className="col-span-2 rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
              <input
                type="text"
                required
                placeholder="Postal code"
                value={form.postalCode}
                onChange={set('postalCode')}
                className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <input
              type="text"
              required
              maxLength={2}
              placeholder="Country (e.g. RO)"
              value={form.country}
              onChange={set('country')}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </fieldset>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" loading={loading} className="w-full">
            Pay with Stripe →
          </Button>
        </form>

        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">
                    {item.productTitle}
                    {item.variantTitle !== 'Default' && ` · ${item.variantTitle}`}
                    {' ×'}{item.quantity}
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatPrice(item.price * item.quantity, currency)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-gray-200 pt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              You'll complete payment securely on Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
