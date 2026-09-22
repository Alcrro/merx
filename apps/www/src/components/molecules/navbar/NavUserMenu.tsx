'use client'

import { useRef, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { logoutAction } from '@/features/auth/actions'
import { getInitials } from '@/lib/utils'
import type { WwwUser } from '@/services/session'
import { ExternalIcon } from '@/components/atoms/ExternalIcon'

interface NavUserMenuProps {
  user: WwwUser
}

export function NavUserMenu({ user }: NavUserMenuProps) {
  const t = useTranslations('nav')
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      return () => cancelAnimationFrame(raf)
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 150)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const initials = getInitials(user.name ?? user.email)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-surface-subtle transition-colors"
        aria-label="Meniu cont"
        aria-expanded={open}
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <span className="w-7 h-7 rounded-full bg-primary-subtle text-primary text-xs font-semibold flex items-center justify-center select-none">
            {initials}
          </span>
        )}
        <span className="hidden lg:block text-sm font-medium text-fg max-w-[120px] truncate">
          {user.name ?? user.email}
        </span>
        <svg className={`w-3.5 h-3.5 text-fg-muted transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-line bg-surface-elevated shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-50">
          {/* User info */}
          <div className="px-4 py-3 flex items-center gap-3">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <span className="w-8 h-8 rounded-full bg-primary-subtle text-primary text-xs font-semibold flex items-center justify-center select-none shrink-0">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-fg truncate leading-tight">{user.name ?? '—'}</p>
              <p className="text-xs text-fg-muted truncate leading-tight">{user.email}</p>
            </div>
          </div>

          <div className="border-t border-line mx-2" />

          {/* Links */}
          <div className="p-1.5 space-y-0.5">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-fg-muted hover:text-fg hover:bg-surface-subtle transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              {t('account')}
            </Link>
            <a
              href="/api/auth/sso"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-fg-muted hover:text-fg hover:bg-surface-subtle transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
              Dashboard
              <ExternalIcon />
            </a>
          </div>

          <div className="border-t border-line mx-2" />

          {/* Logout */}
          <div className="p-1.5">
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-error hover:bg-error/5 transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                {t('logout')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
