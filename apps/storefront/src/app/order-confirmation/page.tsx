import { Suspense } from 'react'
import type { Metadata } from 'next'
import { OrderConfirmationContent } from './_content'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
          <p className="text-sm text-gray-400">Se încarcă comanda...</p>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  )
}
