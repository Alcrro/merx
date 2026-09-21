'use client'

import { useActionState, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { sendContactEmail } from '@/features/contact/actions'
import type { ContactFormState } from '@/features/contact/types'
import { TOPIC_KEYS } from '@/features/contact/config'
import { trackEvent } from '@/lib/analytics'

const INITIAL_STATE: ContactFormState = { status: 'idle' }
const MAX_CHARS = 2000

export function ContactForm({ initialTopic }: { initialTopic?: string }) {
  const t = useTranslations('contact')
  const [state, action, pending] = useActionState(sendContactEmail, INITIAL_STATE)
  const [bodyLength, setBodyLength] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (state.status === 'success') {
      trackEvent('contact_form_submitted')
    }
  }, [state.status])

  function handleFirstInput() {
    if (started) return
    setStarted(true)
    trackEvent('contact_form_started')
  }

  if (state.status === 'success') {
    const responseTime = state.responseTimeKey
      ? t(`channels.items.${state.responseTimeKey}.responseTime` as 'channels.items.sales.responseTime')
      : null

    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <p className="text-2xl mb-2">✓</p>
        <p className="font-semibold text-fg mb-1">{t('form.successTitle')}</p>
        <p className="text-sm text-fg-muted">
          {responseTime
            ? t('form.successWithTime', { time: responseTime })
            : t('form.successFallback')}
        </p>
      </div>
    )
  }

  return (
    <form action={action} onFocus={handleFirstInput} className="space-y-5">
      <input
        type="text"
        name="_trap"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        autoComplete="off"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-widest text-fg-subtle mb-1.5">
            {t('form.name')}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Ion Popescu"
            className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-fg-subtle mb-1.5">
            {t('form.email')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="ion@magazin.ro"
            className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
          />
        </div>
      </div>

      <div>
        <label htmlFor="topic" className="block text-xs font-semibold uppercase tracking-widest text-fg-subtle mb-1.5">
          {t('form.subject')}
        </label>
        <select
          id="topic"
          name="topic"
          required
          defaultValue={initialTopic ?? ''}
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
        >
          <option value="" disabled>{t('form.subjectPlaceholder')}</option>
          {TOPIC_KEYS.map((key) => (
            <option key={key} value={key}>
              {t(`topics.${key}` as 'topics.sales')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="body" className="block text-xs font-semibold uppercase tracking-widest text-fg-subtle">
            {t('form.message')}
          </label>
          <span className={`text-xs tabular-nums ${bodyLength > MAX_CHARS * 0.9 ? 'text-warning' : 'text-fg-subtle'}`}>
            {bodyLength}/{MAX_CHARS}
          </span>
        </div>
        <textarea
          id="body"
          name="body"
          required
          rows={5}
          maxLength={MAX_CHARS}
          placeholder={t('form.messagePlaceholder')}
          onChange={(e) => setBodyLength(e.target.value.length)}
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition resize-none"
        />
      </div>

      {state.status === 'error' && (
        <p role="alert" className="text-sm text-error">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? t('form.submitting') : t('form.submit')}
      </button>
    </form>
  )
}
