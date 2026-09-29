'use client'

import { Button } from '@/components/atoms/Button'

interface PlanChangeFormProps {
  formAction: (payload: FormData) => void
  planId: string
  pending: boolean
  error?: string
  isDowngrade: boolean
  ctaLabel: string
  processingLabel: string
  cancelLabel: string
  keepPlanLabel?: string
}

export function PlanChangeForm({
  formAction,
  planId,
  pending,
  error,
  isDowngrade,
  ctaLabel,
  processingLabel,
  cancelLabel,
  keepPlanLabel,
}: PlanChangeFormProps) {
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="planId" value={planId} />

      <Button type="submit" disabled={pending} aria-busy={pending} className="w-full rounded-xl">
        {pending ? processingLabel : ctaLabel}
      </Button>

      {error && <p className="text-xs text-error text-center">{error}</p>}

      <div className="flex items-center justify-between text-sm">
        <Button variant="ghost" size="sm" href="/pricing">{cancelLabel}</Button>
        {isDowngrade && keepPlanLabel && (
          <Button variant="link" size="sm" href="/pricing">{keepPlanLabel}</Button>
        )}
      </div>
    </form>
  )
}
