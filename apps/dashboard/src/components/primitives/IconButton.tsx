import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  label: string
  variant?: 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function IconButton({
  children,
  label,
  variant = 'ghost',
  size = 'sm',
  className,
  ...props
}: IconButtonProps) {
  const sizes = {
    sm: 'p-1',
    md: 'p-1.5',
  }

  const variants = {
    ghost:  'text-fg-muted hover:text-fg-secondary hover:bg-surface-hover',
    danger: 'text-fg-muted hover:text-danger-text hover:bg-danger-subtle',
  }

  return (
    <button
      type="button"
      aria-label={label}
      className={[
        'inline-flex items-center justify-center rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size],
        variants[variant],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}

export function XIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}
