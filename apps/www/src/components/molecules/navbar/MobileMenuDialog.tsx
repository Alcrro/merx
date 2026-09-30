'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/components/atoms/Button'
import { ChevronIcon } from '@/components/atoms/ChevronIcon'
import { CloseIcon } from '@/components/atoms/CloseIcon'
import { Logo } from '@/components/atoms/Logo'
import { logoutAction } from '@/features/auth/actions'
import type { NavItem } from '@/config/nav'
import type { WwwUser } from '@/services/session'

interface MobileMenuDialogProps {
  dialogRef: React.RefObject<HTMLDivElement | null>
  items: readonly NavItem[]
  dashboardUrl: string
  user: WwwUser | null
  expanded: string | null
  setExpanded: React.Dispatch<React.SetStateAction<string | null>>
  onClose: () => void
}

export function MobileMenuDialog({
  dialogRef,
  items,
  dashboardUrl,
  user,
  expanded,
  setExpanded,
  onClose,
}: MobileMenuDialogProps) {
  const t = useTranslations('nav')

  return (
    <div
      ref={dialogRef}
      id="mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-label="Meniu navigare"
      className="fixed inset-0 z-50 flex flex-col bg-surface md:hidden"
    >
      <div className="flex items-center justify-between px-5 h-16 border-b border-line">
        <Logo />
        <Button variant="ghost" size="icon" aria-label="Închide meniu" onClick={onClose}>
          <CloseIcon />
        </Button>
      </div>

      <nav aria-label="Navigare mobilă" className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {items.map((item) => (
          <div key={item.label}>
            {'dropdown' in item ? (
              <>
                <Button
                  variant="ghost"
                  aria-expanded={expanded === item.label}
                  onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                  className="w-full justify-between rounded-xl px-4 py-3 h-auto"
                >
                  {item.label}
                  <ChevronIcon
                    className={cn(
                      'transition-transform motion-reduce:transition-none',
                      expanded === item.label && 'rotate-180',
                    )}
                  />
                </Button>
                {expanded === item.label && (
                  <div className="mt-1 ml-4 space-y-1 border-l-2 border-indigo-100 pl-4">
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={onClose}
                        className="block rounded-lg px-3 py-2 text-sm text-fg-muted hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                onClick={onClose}
                className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-fg-muted hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-line flex flex-col gap-2">
        {user ? (
          <>
            <div className="px-1 py-1">
              <p className="text-xs font-medium text-fg truncate">{user.name ?? user.email}</p>
              <p className="text-xs text-fg-muted truncate">{user.name ? user.email : ''}</p>
            </div>
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium text-fg-muted border border-line-strong hover:bg-surface-subtle transition-colors"
            >
              {t('account')}
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium text-error border border-error/30 hover:bg-error/5 transition-colors"
              >
                {t('logout')}
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href={`${dashboardUrl}/login`}
              onClick={onClose}
              className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium text-fg-muted border border-line-strong hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('login')}
            </Link>
            <Link
              href={`${dashboardUrl}/signup`}
              onClick={onClose}
              className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors"
            >
              {t('startFree')}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
