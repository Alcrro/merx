import type { BillingCard } from '@/features/account/services/billing.api'
import { BrandLogo } from '../atoms/BrandLogo'

const BRAND_GRADIENTS: Record<string, string> = {
  visa: 'from-blue-900 via-blue-800 to-blue-950',
  mastercard: 'from-slate-800 via-slate-900 to-gray-950',
  amex: 'from-indigo-900 via-indigo-800 to-indigo-950',
  discover: 'from-orange-800 via-orange-900 to-gray-950',
}

interface PaymentCardProps {
  card: BillingCard
  holderName?: string | null
}

export function PaymentCard({ card, holderName }: PaymentCardProps) {
  const gradient = BRAND_GRADIENTS[card.brand] ?? 'from-gray-800 via-gray-900 to-gray-950'
  const expMonth = String(card.expMonth).padStart(2, '0')
  const expYear = String(card.expYear).slice(-2)

  return (
    <div className="relative w-full max-w-sm h-44 rounded-2xl overflow-hidden select-none">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />

      <div className="relative h-full flex flex-col justify-between p-5">
        <div className="flex items-start justify-between">
          <span className="text-white font-bold text-base tracking-wide">Merx</span>
          <div className="w-9 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-90" />
        </div>

        <div className="flex items-center gap-3 text-white/80 text-sm font-mono tracking-widest">
          <span>••••</span>
          <span>••••</span>
          <span>••••</span>
          <span className="text-white font-semibold">{card.last4}</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Card holder</p>
            <p className="text-white text-sm font-medium">{holderName ?? '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Expires</p>
            <p className="text-white text-sm font-medium">{expMonth}/{expYear}</p>
          </div>
          <BrandLogo brand={card.brand} />
        </div>
      </div>
    </div>
  )
}
