import Link from 'next/link'
import { Logo } from '@/components/atoms/Logo'

export default function NotFound() {
  return (
    <html lang="ro">
      <body className="bg-white text-gray-900 font-sans antialiased">
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <Logo />

      <p className="mt-10 text-8xl font-extrabold text-fg tracking-tight">404</p>
      <p className="mt-4 text-xl font-semibold text-fg">Pagina nu există</p>
      <p className="mt-2 text-sm text-fg-muted max-w-sm">
        Linkul pe care l-ai accesat e greșit sau pagina a fost mutată.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
      >
        Înapoi acasă
      </Link>
    </div>
      </body>
    </html>
  )
}
