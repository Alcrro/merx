import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pagină negăsită',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Pagina nu există</h1>
      <p className="text-gray-500 text-sm mb-8">
        Linkul e greșit sau pagina a fost mutată.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center justify-center px-5 py-2.5 rounded bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
      >
        Vezi produsele
      </Link>
    </div>
  )
}
