import Link from 'next/link'

interface StorefrontFooterProps {
  storeName: string
}

export function StorefrontFooter({ storeName }: StorefrontFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {year} {storeName} · Powered by Merx
          </p>

          <nav className="flex items-center gap-5 text-sm text-gray-500">
            <Link href="/products" className="hover:text-gray-900 transition-colors">
              Produse
            </Link>
            <a href="mailto:contact@merx.com" className="hover:text-gray-900 transition-colors">
              Contact
            </a>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400 text-xs">Politica de retur: 30 zile</span>
          </nav>
        </div>
      </div>
    </footer>
  )
}
