import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getAccountUser, getTrialDaysLeft } from '@/services/account'
import { getInitials } from '@/lib/utils'

export default async function ProfilePage() {
  const user = await getAccountUser()
  if (!user) redirect('/login')

  const t = await getTranslations('account.profile')
  const ts = await getTranslations('account.security')
  const tsub = await getTranslations('account.subscription')
  const daysLeft = getTrialDaysLeft(user.trialEndsAt)

  const localeLabel = user.preferredLocale === 'ro'
    ? t('fields.languageRo')
    : t('fields.languageEn')

  const initials = getInitials(user.name ?? user.email)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">{t('title')}</h1>
        <p className="text-sm text-fg-muted mt-1">{t('subtitle')}</p>
      </div>

      {/* Profile */}
      <div className="rounded-2xl border border-line bg-surface-elevated shadow-md dark:shadow-none overflow-hidden">
        <div className="px-4 sm:px-5 py-5 flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-line"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-primary-subtle text-primary text-xl font-bold flex items-center justify-center shrink-0 select-none">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-fg truncate">{user.name ?? '—'}</p>
            <p className="text-xs text-fg-muted truncate mt-0.5">{user.email}</p>
            <p className="text-xs text-fg-subtle mt-1">{localeLabel}</p>
          </div>
          <Link
            href="/account/profile/edit"
            className="shrink-0 text-xs font-medium text-fg-muted border border-line rounded-lg px-3 py-1.5 hover:border-line-strong hover:text-fg transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-2xl border border-line bg-surface-elevated shadow-md dark:shadow-none overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-line flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg">{ts('title')}</h2>
          <Link href="/account/security" className="text-xs font-medium text-primary hover:underline">
            Manage →
          </Link>
        </div>
        <div className="divide-y divide-line">
          {/* Password */}
          <div className="px-4 sm:px-5 py-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <p className="text-sm text-fg flex-1">{ts('password.title')}</p>
            {user.password ? (
              <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success shrink-0">
                {ts('connected.linked')}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning shrink-0">
                {ts('password.noPassword')}
              </span>
            )}
          </div>
          {/* Google */}
          <div className="px-4 sm:px-5 py-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <p className="text-sm text-fg flex-1">{ts('connected.google')}</p>
            {user.googleId ? (
              <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success shrink-0">
                {ts('connected.linked')}
              </span>
            ) : (
              <span className="text-xs text-fg-muted shrink-0">—</span>
            )}
          </div>
        </div>
      </div>

      {/* Subscription */}
      {user.planStatus === 'trial' ? (
        <div className={`rounded-2xl border overflow-hidden ${daysLeft <= 1 ? 'border-error/30 bg-error/5' : daysLeft <= 3 ? 'border-warning/30 bg-warning/5' : 'border-line bg-surface-elevated shadow-md dark:shadow-none'}`}>
          <div className="px-4 sm:px-5 py-4 flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${daysLeft <= 1 ? 'bg-error/10' : daysLeft <= 3 ? 'bg-warning/10' : 'bg-primary-subtle'}`}>
                <svg className={`w-4 h-4 ${daysLeft <= 1 ? 'text-error' : daysLeft <= 3 ? 'text-warning' : 'text-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-fg">
                  {daysLeft > 0
                    ? tsub('currentPlan.daysLeft', { days: daysLeft })
                    : tsub('currentPlan.expired')}
                </p>
                <p className="text-xs text-fg-muted mt-0.5">{tsub('currentPlan.limits')}</p>
              </div>
            </div>
            <Link
              href="/account/subscription"
              className="shrink-0 inline-flex items-center rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-colors"
            >
              Upgrade →
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-surface-elevated shadow-md dark:shadow-none overflow-hidden">
          <div className="px-4 sm:px-5 py-4 flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-fg capitalize">{user.planStatus}</p>
                <p className="text-xs text-fg-muted mt-0.5">{tsub('title')}</p>
              </div>
            </div>
            <Link href="/account/subscription" className="text-xs font-medium text-primary hover:underline shrink-0">
              Manage →
            </Link>
          </div>
        </div>
      )}

    </div>
  )
}
