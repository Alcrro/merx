import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

const NAV_SECTIONS = [
  { label: 'Overview', to: '/docs/overview' },
  { label: 'MVP', to: '/docs/mvp-status' },
  { label: 'Decisions', to: '/docs/decisions' },
  { label: 'Engineering', to: '/docs/engineering' },
  { label: 'API', to: '/docs/api' },
  { label: 'Dashboard', to: '/docs/dashboard' },
  { label: 'Storefront', to: '/docs/storefront' },
  { label: 'WWW', to: '/docs/www' },
] as const

export function DocsLayout() {
  const { theme, toggle } = useTheme()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) navigate(`/docs/search?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-6 gap-4 shrink-0 sticky top-0 z-40">
        <span className="font-semibold text-gray-900 dark:text-gray-100 shrink-0">
          Merx <span className="text-indigo-500">Docs</span>
        </span>

        <form onSubmit={handleSearch} className="flex-1 max-w-xs">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Caută..."
            className="w-full px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-indigo-300 dark:focus:border-indigo-700 rounded-lg outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400"
          />
        </form>

        <nav className="flex items-center gap-1 ml-auto">
          {NAV_SECTIONS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm transition ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <button
            onClick={toggle}
            className="ml-2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </nav>
      </header>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
