'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useStore } from '@/contexts/StoreContext'
import { Button } from '@/components/atoms/Button'
import { storefrontApi, formatPrice } from '@/lib/api'

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

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900'

export function CheckoutForm() {
  const { store, slug } = useStore()
  const { items, subtotal } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams()
  const discountCode = searchParams.get('discount') ?? undefined
  const currency = store?.currency ?? 'EUR'

  const [form, setForm] = useState<FormState>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (items.length === 0) {
    router.replace('/cart')
    return null
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
      const { url } = await storefrontApi.checkout(slug, {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        shippingAddress: {
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          country: form.country.toUpperCase().slice(0, 2),
          postalCode: form.postalCode,
        },
        discountCode,
      })
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ceva a mers greșit. Încearcă din nou.')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link href="/cart" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
          ← Înapoi la coș
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
          <section className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
            <Field label="Email">
              <input
                type="email"
                required
                placeholder="adresa@email.com"
                value={form.email}
                onChange={set('email')}
                className={inputCls}
              />
            </Field>
          </section>

          <section className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nume</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Prenume">
                <input
                  type="text"
                  required
                  placeholder="Ion"
                  value={form.firstName}
                  onChange={set('firstName')}
                  className={inputCls}
                />
              </Field>
              <Field label="Nume de familie">
                <input
                  type="text"
                  required
                  placeholder="Popescu"
                  value={form.lastName}
                  onChange={set('lastName')}
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Adresă livrare</p>
            <Field label="Stradă">
              <input
                type="text"
                required
                placeholder="Str. Exemplu, nr. 1"
                value={form.line1}
                onChange={set('line1')}
                className={inputCls}
              />
            </Field>
            <Field label="Apartament, etaj (opțional)">
              <input
                type="text"
                placeholder="Ap. 5, et. 2"
                value={form.line2}
                onChange={set('line2')}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Oraș">
                <input
                  type="text"
                  required
                  placeholder="București"
                  value={form.city}
                  onChange={set('city')}
                  className={`col-span-2 ${inputCls}`}
                />
              </Field>
              <Field label="Cod poștal">
                <input
                  type="text"
                  required
                  placeholder="010101"
                  value={form.postalCode}
                  onChange={set('postalCode')}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Țară (cod ISO, ex: RO)">
              <input
                type="text"
                required
                maxLength={2}
                placeholder="RO"
                value={form.country}
                onChange={set('country')}
                className={inputCls}
              />
            </Field>
          </section>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" loading={loading} className="w-full">
            Plătește cu Stripe →
          </Button>

          <p className="text-xs text-center text-gray-400">
            Vei fi redirecționat pe pagina securizată Stripe pentru plată.
          </p>
        </form>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Sumar comandă</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">
                    {item.productTitle}
                    {item.variantTitle !== 'Default' && ` · ${item.variantTitle}`}
                    {' ×'}{item.quantity}
                  </span>
                  <span className="shrink-0 font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity, currency)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              {discountCode && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Reducere ({discountCode})</span>
                  <span>aplicată</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400 text-xs">
                <span>Transport</span>
                <span>calculat de Stripe</span>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Reducerile și transportul sunt aplicate pe pagina Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
