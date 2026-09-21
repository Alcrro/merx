import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Logo } from '@/components/atoms/Logo'
import { LocaleSwitcher } from '@/components/atoms/LocaleSwitcher'
import { BackArrowIcon } from '../atoms/BackArrowIcon'

export async function AuthHeader() {
  const t = await getTranslations('auth.header')

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Logo />
      <div className="flex items-center gap-1">
        <LocaleSwitcher />
        <Link
          href="/"
          className="text-sm text-fg-muted hover:text-fg transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-surface-subtle"
        >
          <BackArrowIcon />
          {t('home')}
        </Link>
      </div>
    </header>
  )
}
