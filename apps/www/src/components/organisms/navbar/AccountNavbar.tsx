import { Suspense } from 'react'
import { Link } from '@/i18n/navigation'
import { NavUserSkeleton } from '@/components/molecules/navbar/NavUserSkeleton'
import { NavUser } from '@/components/organisms/navbar/NavUser'
import { LocaleSwitcher } from '@/components/atoms/LocaleSwitcher'
import { NavbarShell } from '@/components/organisms/navbar/NavbarShell'

export function AccountNavbar() {
  return (
    <NavbarShell>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-12 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-1.5 select-none group">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 group-hover:bg-indigo-700 transition-colors">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 12V5l5-3 5 3v7l-5 3-5-3Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8 2v12M3 5l5 3 5-3" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-fg">Merx</span>
          </Link>

          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <Suspense fallback={<NavUserSkeleton />}>
              <NavUser />
            </Suspense>
          </div>
        </div>
      </div>
    </NavbarShell>
  )
}
