'use client'

import { useActionState, useState } from 'react'
import { useTranslations } from 'next-intl'
import { requestExportAction } from '@/features/account/actions'
import { Button } from '@/components/atoms/Button'
import { DeleteAccountModal } from './DeleteAccountModal'

interface DangerZoneSectionProps {
  hasPassword: boolean
  lastDataExportAt: Date | null
}

export function DangerZoneSection({ hasPassword, lastDataExportAt }: DangerZoneSectionProps) {
  const t = useTranslations('account.profile')
  const [showModal, setShowModal] = useState(false)
  const [exportState, exportAction, isExportPending] = useActionState(requestExportAction, null)

  const exportedToday =
    exportState?.status !== 'success' &&
    lastDataExportAt !== null &&
    Date.now() - new Date(lastDataExportAt).getTime() < 24 * 60 * 60 * 1000

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface-elevated shadow-md dark:shadow-none px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-surface-subtle border border-line flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-fg">{t('export.title')}</p>
              <p className="text-xs text-fg-muted mt-0.5 leading-relaxed max-w-md">{t('export.description')}</p>
            </div>
          </div>
          <div className="pl-12 sm:pl-0 sm:shrink-0 sm:pt-0.5">
            {exportState?.status === 'success' || exportedToday ? (
              <p className="text-xs text-fg-muted font-medium">{t('export.alreadyRequested')}</p>
            ) : (
              <form action={exportAction}>
                <Button type="submit" variant="outline" size="sm" disabled={isExportPending}>
                  {isExportPending ? '...' : t('export.button')}
                </Button>
                {exportState?.status === 'error' && (
                  <p className="mt-1.5 text-xs text-error text-right">{exportState.message}</p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface-elevated shadow-md dark:shadow-none overflow-hidden">
          <div className="px-4 sm:px-5 py-2.5 border-b border-line bg-error/[0.04] flex items-center gap-2">
            <svg className="w-3 h-3 text-error/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest text-error/60">
              {t('danger.title')}
            </span>
          </div>
          <div className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-error/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-fg">{t('danger.deleteTitle')}</p>
                <p className="text-xs text-fg-muted mt-0.5 leading-relaxed max-w-md">{t('danger.description')}</p>
              </div>
            </div>
            <div className="pl-12 sm:pl-0 sm:shrink-0 sm:pt-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-error hover:bg-error/8 hover:text-error"
                onClick={() => setShowModal(true)}
              >
                {t('danger.button')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <DeleteAccountModal hasPassword={hasPassword} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
