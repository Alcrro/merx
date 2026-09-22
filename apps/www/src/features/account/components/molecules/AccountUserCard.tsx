import { getInitials } from '@/lib/utils'

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  scale: 'Scale',
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  trial:     { label: 'Trial',   className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  active:    { label: 'Activ',   className: 'bg-success/10 text-success' },
  cancelled: { label: 'Anulat',  className: 'bg-error/10 text-error' },
  expired:   { label: 'Expirat', className: 'bg-fg-subtle/10 text-fg-subtle' },
}

interface AccountUserCardProps {
  name: string | null
  email: string
  avatarUrl: string | null
  planStatus: string
  planId: string | null
}

export function AccountUserCard({ name, email, avatarUrl, planStatus, planId }: AccountUserCardProps) {
  const initials = getInitials(name ?? email)
  const statusCfg = STATUS_CONFIG[planStatus] ?? STATUS_CONFIG.trial
  const planLabel = planId ? PLAN_LABELS[planId] ?? planId : null

  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white dark:bg-surface-elevated border border-line shadow-[0_1px_8px_rgba(0,0,0,0.05)] dark:shadow-none">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name ?? email}
          className="w-9 h-9 rounded-full object-cover shrink-0 border border-line"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-primary-subtle border border-primary/20 flex items-center justify-center text-primary text-sm font-semibold select-none shrink-0">
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-fg truncate leading-tight">{name ?? '—'}</p>
        <p className="text-xs text-fg-muted truncate leading-tight">{email}</p>
        <div className="mt-1.5">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusCfg.className}`}>
            {planLabel && planStatus === 'active' ? `${planLabel}` : statusCfg.label}
          </span>
        </div>
      </div>
    </div>
  )
}
