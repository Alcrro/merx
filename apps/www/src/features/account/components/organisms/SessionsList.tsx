'use client'

import { useTranslations } from 'next-intl'
import { parseUA } from '@/lib/ua'
import type { Session } from '@/features/account/types'
import { DeviceIcon } from '../atoms/DeviceIcon'
import { SectionCard } from '../molecules/SectionCard'
import { RevokeAllForm } from './RevokeAllForm'
import { RevokeSessionForm } from './RevokeSessionForm'

interface SessionsListProps {
  sessions: Session[]
}

export function SessionsList({ sessions }: SessionsListProps) {
  const t = useTranslations('account.security.sessions')
  const otherSessions = sessions.filter((s) => !s.isCurrent)

  return (
    <SectionCard
      title={t('title')}
      action={otherSessions.length > 1 ? <RevokeAllForm /> : undefined}
    >
      <div className="px-4 sm:px-5 py-4 space-y-2">
        {sessions.map((session) => {
          const { label, isMobile } = parseUA(session.userAgent)
          return (
            <div key={session.id} className="flex items-center gap-3 rounded-xl bg-surface-subtle px-4 py-3">
              <div className="relative shrink-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${session.isCurrent ? 'bg-primary-subtle' : 'bg-surface'}`}>
                  <DeviceIcon isMobile={isMobile} active={session.isCurrent} />
                </div>
                {session.isCurrent && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-surface-subtle" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-fg truncate">{label}</p>
                <p className="text-xs text-fg-muted mt-0.5">
                  {session.isCurrent && session.ip ? session.ip : null}
                  {!session.isCurrent
                    ? `${t('lastActive')}: ${session.createdAt.toLocaleDateString()}`
                    : null}
                </p>
              </div>

              {!session.isCurrent && <RevokeSessionForm tokenId={session.id} />}
            </div>
          )
        })}

        {sessions.length === 1 && sessions[0]?.isCurrent && (
          <p className="text-xs text-fg-muted">{t('noOther')}</p>
        )}
      </div>
    </SectionCard>
  )
}
