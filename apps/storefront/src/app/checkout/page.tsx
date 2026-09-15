import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CheckoutForm } from './_form'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
        </div>
      }
    >
      <CheckoutForm />
    </Suspense>
  )
}
