import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function Field({ label, error, hint, required, className, children }: FieldProps) {
  return (
    <div className={['flex flex-col gap-1', className].filter(Boolean).join(' ')}>
      <span className="field-label">
        {label}
        {required && <span className="text-danger-text ml-0.5">*</span>}
      </span>
      {children}
      {hint && !error && <p className="text-xs text-fg-muted">{hint}</p>}
      {error && <p className="text-xs text-danger-text">{error}</p>}
    </div>
  )
}
