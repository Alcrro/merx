import { Link } from 'react-router-dom'
import type { ButtonProps } from './Button.types'

export type { ButtonProps } from './Button.types'

const BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition focus:outline-none focus:ring-2 focus:ring-brand-focus focus:ring-offset-1 dark:focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50'

const SIZES = {
  md: 'px-4 py-2 text-sm',
  sm: 'px-3.5 py-1.5 text-xs',
}

const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-active shadow-sm',
  ghost:   'bg-transparent text-fg-secondary hover:bg-surface-hover active:bg-surface-hover',
  outline: 'border border-brand-border text-brand-text hover:bg-brand-subtle',
  danger:  'bg-danger text-white hover:bg-danger-hover active:bg-danger shadow-sm',
}

export function Button(props: ButtonProps) {
  const { children, isLoading, variant = 'primary', size = 'md', fullWidth, className } = props

  const cls = [BASE, SIZES[size], VARIANTS[variant], fullWidth ? 'w-full' : '', className]
    .filter(Boolean)
    .join(' ')


  const content = isLoading ? (
    <span className="flex items-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      Se procesează...
    </span>
  ) : (
    children
  )

  if ('to' in props && props.to !== undefined) {
    const { to, disabled, variant: _v, size: _s, fullWidth: _fw, isLoading: _l, className: _c, ...rest } = props
    return (
      <Link
        to={to}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        {...rest}
        className={[cls, disabled ? 'pointer-events-none opacity-50' : ''].filter(Boolean).join(' ')}
      >
        {content}
      </Link>
    )
  }

  if ('href' in props && props.href !== undefined) {
    const { href, variant: _v, size: _s, fullWidth: _fw, isLoading: _l, className: _c, ...rest } = props
    return (
      <a href={href} {...rest} className={cls}>
        {content}
      </a>
    )
  }

  const { variant: _v, size: _s, fullWidth: _fw, isLoading: _l, disabled, className: _c, ...rest } = props
  return (
    <button disabled={disabled === true || isLoading === true} {...rest} className={cls}>
      {content}
    </button>
  )
}
