import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  isLoading?: boolean
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md'
  fullWidth?: boolean
}

export function Button({
  children,
  isLoading,
  variant = 'primary',
  size = 'md',
  fullWidth,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const sizes = {
    md: 'px-4 py-2 text-sm',
    sm: 'px-3.5 py-1.5 text-xs',
  }

  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50'

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm',
    ghost: 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700',
    outline: 'border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40',
  }

  return (
    <button
      disabled={disabled === true || isLoading === true}
      className={[base, sizes[size], variants[variant], fullWidth ? 'w-full' : '', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Se procesează...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
