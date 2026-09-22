'use client'

import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { SunIcon } from '@/components/atoms/SunIcon'
import { MoonIcon } from '@/components/atoms/MoonIcon'

export function AppearanceSection() {
  const t = useTranslations('account.settings.appearance')
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const themes = [
    { value: 'light', label: t('light'), icon: <SunIcon /> },
    { value: 'dark', label: t('dark'), icon: <MoonIcon /> },
  ]

  return (
    <div className="rounded-2xl border border-line bg-surface-elevated shadow-md dark:shadow-none overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-line">
        <h2 className="text-sm font-semibold text-fg">{t('title')}</h2>
        <p className="text-xs text-fg-muted mt-0.5">{t('subtitle')}</p>
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex gap-3">
          {themes.map(({ value, label, icon }) => {
            const active = mounted && resolvedTheme === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={active}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  active
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg'
                }`}
              >
                {icon}
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
