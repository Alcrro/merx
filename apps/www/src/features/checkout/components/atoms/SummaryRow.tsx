import { cn } from '@/lib/utils'

interface SummaryRowProps {
  label: string
  value: string
  bold?: boolean
}

export function SummaryRow({ label, value, bold }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-fg-muted">{label}</span>
      <span className={cn('text-fg', bold && 'font-semibold')}>{value}</span>
    </div>
  )
}
