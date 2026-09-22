import type { ReactNode } from 'react'

interface SectionCardProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  children: ReactNode
}

export function SectionCard({ title, description, action, className, children }: SectionCardProps) {
  return (
    <div className={`rounded-2xl border border-line bg-surface-elevated shadow-md dark:shadow-none overflow-hidden${className ? ` ${className}` : ''}`}>
      <div className="px-4 sm:px-6 py-4 border-b border-line flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-fg">{title}</h2>
          {description && <p className="text-xs text-fg-muted mt-0.5">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  )
}
