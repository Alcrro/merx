interface PlanSwitchPreviewProps {
  currentPlanName: string
  currentPrice: number
  newPlanName: string
  newPrice: number
  currentLabel: string
  newLabel: string
}

export function PlanSwitchPreview({
  currentPlanName,
  currentPrice,
  newPlanName,
  newPrice,
  currentLabel,
  newLabel,
}: PlanSwitchPreviewProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-xl bg-surface-subtle p-3 text-center">
        <p className="text-xs text-fg-muted mb-0.5">{currentLabel}</p>
        <p className="text-sm font-semibold text-fg truncate">{currentPlanName}</p>
        <p className="text-xs text-fg-muted mt-0.5">€{currentPrice}/lună</p>
      </div>
      <span className="text-fg-muted shrink-0 text-base">→</span>
      <div className="flex-1 rounded-xl bg-primary p-3 text-center">
        <p className="text-xs text-white/60 mb-0.5">{newLabel}</p>
        <p className="text-sm font-semibold text-white truncate">{newPlanName}</p>
        <p className="text-xs text-white/60 mt-0.5">€{newPrice}/lună</p>
      </div>
    </div>
  )
}
