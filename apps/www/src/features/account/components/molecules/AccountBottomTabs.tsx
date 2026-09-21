'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { BOTTOM_NAV_ITEMS } from '@/features/account/config'

export function AccountBottomTabs() {
  const t = useTranslations('account.nav')
  const pathname = usePathname()

  return (
    <nav aria-label="Navigare cont" className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-surface/95 backdrop-blur-sm md:hidden">
      <div className="grid grid-cols-4">
        {BOTTOM_NAV_ITEMS.map(({ key, href, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={key}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                active ? 'text-primary' : 'text-fg-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              {t(key)}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
