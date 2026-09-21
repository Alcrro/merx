'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { NAV_ITEMS } from '@/features/account/config'
import { DashboardIcon } from '../atoms/DashboardIcon'

export function AccountSidebar() {
  const t = useTranslations('account.nav')
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-1.5">
      <a
        href="/api/auth/sso"
        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors bg-primary-subtle text-primary hover:bg-primary-hover hover:text-primary-fg md:w-full"
      >
        <DashboardIcon className="w-4 h-4 shrink-0" />
        {t('dashboard')}
      </a>

      <aside className="rounded-2xl bg-white dark:bg-surface-elevated p-2 md:border md:border-line md:shadow-[0_2px_12px_rgba(0,0,0,0.06)] md:dark:shadow-none">
        <nav className="flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:flex-col md:overflow-visible md:space-y-0.5 md:gap-0">
          {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={key}
                href={href}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap md:w-full md:gap-3 md:py-2.5 ${
                  active
                    ? 'bg-primary-subtle text-primary'
                    : 'text-fg-muted hover:text-fg hover:bg-surface-subtle'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {t(key)}
              </Link>
            )
          })}
        </nav>
      </aside>
    </div>
  )
}
