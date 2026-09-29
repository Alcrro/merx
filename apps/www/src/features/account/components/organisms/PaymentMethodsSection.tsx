import { useTranslations } from 'next-intl'
import type { BillingCard } from '@/features/account/services/billing.api'
import { openBillingPortalAction } from '@/features/account/actions'
import { Button } from '@/components/atoms/Button'
import { SectionCard } from '../molecules/SectionCard'

interface PaymentMethodsSectionProps {
  cards: BillingCard[]
}

// Read-only list — cards are added, removed and set as default in the Stripe Customer Portal.
export function PaymentMethodsSection({ cards }: PaymentMethodsSectionProps) {
  const t = useTranslations('account.billing.paymentMethod')

  return (
    <SectionCard
      title={t('title')}
      action={
        <form action={openBillingPortalAction}>
          <Button type="submit" size="sm" variant="outline">
            {t('manage')}
          </Button>
        </form>
      }
    >
      {cards.length === 0 ? (
        <div className="px-4 sm:px-6 py-10 text-center">
          <p className="text-sm text-fg-muted">{t('noCard')}</p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {cards.map((card) => (
            <li key={card.id} className="px-4 sm:px-6 py-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="inline-flex items-center justify-center rounded-md border border-line bg-surface-subtle px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-fg-muted min-w-[44px]">
                {card.brand}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-fg font-mono tracking-wider">
                  •••• {card.last4}
                </p>
                <p className="text-xs text-fg-muted">
                  {t('expires', {
                    month: String(card.expMonth).padStart(2, '0'),
                    year: String(card.expYear).slice(-2),
                  })}
                </p>
              </div>

              {card.isDefault && (
                <span className="ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                  {t('defaultBadge')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
