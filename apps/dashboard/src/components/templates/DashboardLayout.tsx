import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ThemeToggle } from '../atoms/ThemeToggle'

const navItems = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/products', label: 'Produse', end: false },
  { to: '/orders', label: 'Comenzi', end: false },
  { to: '/inventory', label: 'Inventar', end: false },
  { to: '/analytics', label: 'Analytics', end: false },
  { to: '/ai', label: 'AI Agent', end: false },
  { to: '/settings/store', label: 'Setări', end: false },
]

export function DashboardLayout() {
  const { user, store, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Merx</span>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'px-3 py-1.5 rounded-lg text-sm transition',
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-medium'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-sm text-gray-400 dark:text-gray-500">{store?.name}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition"
          >
            Ieși
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
