import { SummaryRow } from '../atoms/SummaryRow'

interface PlanChangeSummaryProps {
  costLabel: string
  costValue: string
  effectiveLabel: string
  effectiveValue: string
  note: string
}

export function PlanChangeSummary({
  costLabel,
  costValue,
  effectiveLabel,
  effectiveValue,
  note,
}: PlanChangeSummaryProps) {
  return (
    <div className="space-y-2.5">
      <SummaryRow label={costLabel} value={costValue} />
      <SummaryRow label={effectiveLabel} value={effectiveValue} bold />
      <p className="text-xs text-fg-muted leading-relaxed pt-1">{note}</p>
    </div>
  )
}
