import { redirect } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import { getAccessToken, getPaymentMethodsApi, getInvoicesApi } from '@/features/account/services/billing.api'
import { PaymentMethodsSection } from '@/features/account/components/organisms/PaymentMethodsSection'

const LOCALE_MAP: Record<string, string> = {
  ro: 'ro-RO',
  en: 'en-US',
}

function formatAmount(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(LOCALE_MAP[locale] ?? locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100)
}

function formatDate(unix: number, locale: string) {
  return new Date(unix * 1000).toLocaleDateString(LOCALE_MAP[locale] ?? locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const STATUS_STYLES = {
  paid: 'bg-success/10 text-success',
  open: 'bg-warning/10 text-warning',
  void: 'bg-surface-subtle text-fg-muted',
  uncollectible: 'bg-error/10 text-error',
} as const

type InvoiceStatus = keyof typeof STATUS_STYLES

export default async function BillingPage() {
  const [accessToken, t, locale] = await Promise.all([
    getAccessToken(),
    getTranslations('account.billing'),
    getLocale(),
  ])

  if (!accessToken) redirect('/login')

  const [cards, invoices] = await Promise.all([
    getPaymentMethodsApi(accessToken),
    getInvoicesApi(accessToken),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">{t('title')}</h1>
        <p className="text-sm text-fg-muted mt-1">{t('subtitle')}</p>
      </div>

      <PaymentMethodsSection cards={cards} />

      <div className="rounded-2xl border border-line bg-surface-elevated shadow-md dark:shadow-none overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-line">
          <h2 className="text-sm font-semibold text-fg">{t('invoices.title')}</h2>
        </div>

        {invoices.length === 0 ? (
          <div className="px-4 sm:px-6 py-10 text-center">
            <svg className="w-8 h-8 text-fg-subtle mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p className="text-sm text-fg-muted">{t('invoices.empty')}</p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {invoices.map((inv) => (
              <div key={inv.id} className="px-4 sm:px-6 py-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-fg truncate">{inv.number ?? inv.id}</p>
                  <p className="text-xs text-fg-muted">{formatDate(inv.date, locale)}</p>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm font-semibold text-fg">{formatAmount(inv.amount, inv.currency, locale)}</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[inv.status as InvoiceStatus] ?? STATUS_STYLES.void}`}>
                    {t(`invoices.status.${inv.status as InvoiceStatus}`, { defaultValue: inv.status })}
                  </span>
                  {inv.pdfUrl ? (
                    <a
                      href={inv.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Descarcă factura ${inv.number ?? inv.id} (PDF)`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      PDF
                    </a>
                  ) : (
                    <span className="text-xs text-fg-subtle w-7" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
