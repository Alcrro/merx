import type { ReactNode } from 'react'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Merx</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">AI e-commerce operator</p>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          {subtitle && <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}

          {children}
        </div>

        {footer && (
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">{footer}</div>
        )}
      </div>
    </div>
  )
}
