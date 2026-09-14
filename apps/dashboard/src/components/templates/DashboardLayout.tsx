import { useRef, useState, useEffect } from 'react'
import { NavLink, Outlet, Link, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { NotificationBell } from '../organisms/notifications/NotificationBell'
import { useNotificationsStore } from '../../stores/notificationsStore'

const navItems = [
  { to: '/orders', label: 'Comenzi' },
  { to: '/inventory', label: 'Inventar' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/customers', label: 'Clienți' },
  { to: '/discounts', label: 'Reduceri' },
]

const adminNavItems = [
  { to: '/admin/catalog', label: 'Catalog' },
  { to: '/admin/product-requests', label: 'Cereri' },
  { to: '/admin/archive-criteria', label: 'Arhivare' },
  { to: '/admin/ai-criteria', label: 'AI Criterii' },
]

const productsDropdownItems = [
  { to: '/products/catalog', label: 'Catalog' },
  { to: '/products', label: 'Produsele mele' },
  { to: '/products/requests', label: 'Cereri' },
]

const activeClass = 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-medium'
const inactiveClass = 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
const baseLinkClass = 'px-3 py-1.5 rounded-lg text-sm transition'

function ProductsDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()

  const isProductsActive = location.pathname.startsWith('/products')

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center">
        <NavLink
          to="/products"
          end={false}
          className={[
            baseLinkClass,
            'rounded-r-none pr-1',
            isProductsActive ? activeClass : inactiveClass,
          ].join(' ')}
        >
          Produse
        </NavLink>
        <button
          onClick={() => setOpen((o) => !o)}
          className={[
            'px-1 py-1.5 rounded-r-lg text-sm transition border-l border-gray-200 dark:border-gray-700',
            isProductsActive ? activeClass : inactiveClass,
          ].join(' ')}
          aria-label="Produse submeniu"
        >
          <svg
            className={['h-3 w-3 transition-transform', open ? 'rotate-180' : ''].join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5 dark:ring-white/5 z-50 overflow-hidden p-1">
          {productsDropdownItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/products'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                [
                  'block px-3 py-2 rounded-lg text-sm transition',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

function SettingsDropdown() {
  const { user, store, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition',
          open
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
        ].join(' ')}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        {store?.name && <span className="max-w-[120px] truncate">{store.name}</span>}
        <svg
          className={['h-3 w-3 transition-transform', open ? 'rotate-180' : ''].join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5 dark:ring-white/5 z-50 overflow-hidden">
          {/* Account */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            {user ? (
              <>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Cont</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{user.email}</p>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between w-full text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
              >
                Intră în cont
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
              </Link>
            )}
          </div>

          {/* Appearance */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Aspect</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </span>
              <button
                onClick={toggle}
                aria-label="Toggle theme"
                className={[
                  'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1',
                  theme === 'dark'
                    ? 'bg-indigo-600 focus:ring-offset-gray-900'
                    : 'bg-gray-200 focus:ring-offset-white',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300',
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1',
                  ].join(' ')}
                >
                  {theme === 'dark' ? (
                    <svg className="h-2.5 w-2.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  ) : (
                    <svg className="h-2.5 w-2.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Settings link + logout */}
          <div className="p-1.5">
            {user && (
              <>
                <Link
                  to="/settings/store"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  Setări magazin
                </Link>
                {store && (
                  <button
                    onClick={() => { setOpen(false); navigate('/settings/store?tab=general&tour=1') }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                    </svg>
                    Tour setări magazin
                  </button>
                )}
                <button
                  onClick={() => { setOpen(false); logout() }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  Ieși din cont
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AdminDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const isAdminActive = location.pathname.startsWith('/admin')

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition',
          isAdminActive ? activeClass : inactiveClass,
        ].join(' ')}
      >
        Admin
        <svg
          className={['h-3 w-3 transition-transform', open ? 'rotate-180' : ''].join(' ')}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5 dark:ring-white/5 z-50 overflow-hidden p-1">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                [
                  'block px-3 py-2 rounded-lg text-sm transition',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export function DashboardLayout() {
  const { user, store } = useAuth()
  const isThemeBuilder = !!useMatch('/theme')
  const unreadCount = useNotificationsStore((s) => s.unreadCount)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">Merx</span>
          <nav className="flex items-center gap-1">
            {user && !store && (
              <NavLink
                to="/subscribe"
                className={({ isActive }) =>
                  [
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition',
                    isActive
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40',
                  ].join(' ')
                }
              >
                Devino Vânzător
              </NavLink>
            )}

            {user && store && (
              <>
                <NavLink
                  to="/dashboard"
                  end
                  className={({ isActive }) => [baseLinkClass, isActive ? activeClass : inactiveClass].join(' ')}
                >
                  Overview
                </NavLink>

                <NavLink
                  to="/ai"
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900',
                    ].join(' ')
                  }
                >
                  <span className="text-xs">✦</span>
                  AI Agent
                </NavLink>

                <div className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />

                <ProductsDropdown />

                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => [baseLinkClass, isActive ? activeClass : inactiveClass].join(' ')}
                  >
                    {item.label}
                  </NavLink>
                ))}

                <NavLink
                  to="/theme"
                  className={({ isActive }) => [baseLinkClass, isActive ? activeClass : inactiveClass].join(' ')}
                >
                  Temă
                </NavLink>

                <NavLink
                  to="/notifications"
                  className={({ isActive }) => [baseLinkClass, 'flex items-center gap-1.5', isActive ? activeClass : inactiveClass].join(' ')}
                >
                  Notificări
                  {unreadCount > 0 && (
                    <span className="flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </NavLink>

                {user.platformRole === 'admin' && (
                  <>
                    <div className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />
                    <AdminDropdown />
                  </>
                )}
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          {user && <NotificationBell />}
          <SettingsDropdown />
        </div>
      </header>

      <main className={isThemeBuilder ? 'flex-1 flex flex-col overflow-hidden' : 'flex-1 p-6'}>
        <Outlet />
      </main>
    </div>
  )
}
