import { useRef, useEffect } from 'react'
import type { ReactNode } from 'react'

interface DropdownBaseProps {
  trigger: ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  disabled?: boolean
  error?: boolean
  width?: 'full' | 'auto'
  className?: string
}

export function DropdownBase({
  trigger,
  open,
  onOpenChange,
  children,
  disabled,
  error,
  width = 'full',
  className,
}: DropdownBaseProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpenChange(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onOpenChange])

  return (
    <div className={['relative', className].filter(Boolean).join(' ')} ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onOpenChange(!open)}
        className={[
          'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors outline-none bg-surface text-fg-primary disabled:opacity-50 disabled:cursor-not-allowed',
          width === 'full' ? 'w-full' : '',
          error
            ? 'border-danger'
            : open
              ? 'border-brand-focus ring-2 ring-brand-focus/20'
              : 'border-border-strong hover:border-border',
        ].filter(Boolean).join(' ')}
      >
        {/* trigger wraps in flex-1 so extra actions (clear btn etc.) stay before the chevron */}
        <div className="flex-1 flex items-center gap-1 min-w-0">{trigger}</div>
        <svg
          className={['h-4 w-4 text-fg-muted shrink-0 transition-transform', open ? 'rotate-180' : ''].join(' ')}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="dropdown-panel left-0 top-full mt-1.5 w-full">
          {children}
        </div>
      )}
    </div>
  )
}
