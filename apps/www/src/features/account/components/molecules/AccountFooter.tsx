import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function AccountFooter() {
  const t = useTranslations('footer')

  return (
    <footer className="border-t border-line py-5 px-4">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-fg-subtle">
          © {new Date().getFullYear()} Merx. {t('copyright')}
        </p>
        <nav className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-2">
          <Link href="/privacy" className="text-xs text-fg-subtle hover:text-fg transition-colors">
            {t('links.privacy')}
          </Link>
          <Link href="/terms" className="text-xs text-fg-subtle hover:text-fg transition-colors">
            {t('links.terms')}
          </Link>
          <Link href="/contact" className="text-xs text-fg-subtle hover:text-fg transition-colors">
            {t('links.contact')}
          </Link>
        </nav>
      </div>
    </footer>
  )
}
