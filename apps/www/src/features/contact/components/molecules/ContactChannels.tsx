'use client'

import { useTranslations } from 'next-intl'
import { trackEvent } from '@/lib/analytics'
import type { ContactChannel } from '@/features/contact/config'

interface ContactChannelsProps {
  channels: ContactChannel[]
}

export function ContactChannels({ channels }: ContactChannelsProps) {
  const t = useTranslations('contact')

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-fg mb-6">{t('channels.heading')}</h2>
      {channels.map((ch) => (
        <a
          key={ch.email}
          href={`mailto:${ch.email}`}
          onClick={() => trackEvent('contact_channel_clicked', { channel: ch.label })}
          className="group flex flex-col rounded-xl bg-surface-elevated p-4 shadow-[0_0_16px_rgba(0,0,0,0.07)] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-shadow"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-fg-subtle mb-1">
            {ch.label}
          </p>
          <p className="text-sm font-semibold text-primary group-hover:underline">
            {ch.email}
          </p>
          <p className="mt-1 text-xs text-fg-muted">{ch.description}</p>
          <p className="mt-1 text-xs text-fg-subtle">{ch.responseTime}</p>
        </a>
      ))}
    </div>
  )
}
