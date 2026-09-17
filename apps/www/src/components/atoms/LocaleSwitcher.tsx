'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useTransition } from 'react'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const nextLocale = locale === 'en' ? 'ro' : 'en'
  const label = locale === 'en' ? 'RO' : 'EN'

  function handleSwitch() {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      aria-label={`Switch to ${nextLocale === 'en' ? 'English' : 'Romanian'}`}
      className="h-9 w-9 rounded-lg text-xs font-semibold text-fg-muted hover:text-fg hover:bg-surface-subtle transition-colors disabled:opacity-50"
    >
      {label}
    </button>
  )
}
