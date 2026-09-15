'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  className?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded font-medium whitespace-nowrap transition focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50'

  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-700 active:bg-gray-800',
    secondary:
      'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  }

  return (
    <button
      disabled={disabled === true || loading === true}
      className={[base, variants[variant], sizes[size], className].filter(Boolean).join(' ')}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Se procesează...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
