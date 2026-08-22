import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '../../atoms/Button'

function PaymentForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    setError(null)
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })
    setProcessing(false)
    if (result.error) {
      setError(result.error.message ?? 'Plata a eșuat.')
    } else if (result.paymentIntent?.status === 'succeeded') {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={processing} className="flex-1">
          Anulează
        </Button>
        <Button type="submit" disabled={!stripe || processing} className="flex-1">
          {processing ? 'Se procesează...' : 'Plătește acum'}
        </Button>
      </div>
    </form>
  )
}

interface CheckoutModalProps {
  clientSecret: string
  stripePublishableKey: string
  breakdown: { amount: number; sellerPayout: number; merxCommission: number; stripeFee: number; currency: string }
  productTitle: string
  onSuccess: () => void
  onClose: () => void
}

export function CheckoutModal({
  clientSecret,
  stripePublishableKey,
  breakdown,
  productTitle,
  onSuccess,
  onClose,
}: CheckoutModalProps) {
  const [stripePromise] = useState(() => loadStripe(stripePublishableKey))
  const [paid, setPaid] = useState(false)

  function handleSuccess() {
    setPaid(true)
    setTimeout(onSuccess, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Finalizare comandă</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          {paid ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Plată procesată cu succes!</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                Suma va fi transferată vânzătorului după perioada de escrow (14 zile).
              </p>
            </div>
          ) : (
            <>
              {/* Order summary */}
              <div className="mb-5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-4 py-3 space-y-1.5">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{productTitle}</p>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Comision Merx</span>
                  <span>
                    {breakdown.merxCommission.toFixed(2)} {breakdown.currency}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Taxă Stripe</span>
                  <span>
                    {breakdown.stripeFee.toFixed(2)} {breakdown.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-gray-900 dark:text-gray-100 pt-1 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span>
                    {breakdown.amount.toFixed(2)} {breakdown.currency}
                  </span>
                </div>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <PaymentForm onSuccess={handleSuccess} onCancel={onClose} />
              </Elements>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
