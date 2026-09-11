import { formatMoney } from '../../../lib/format'

interface OrderSummaryCardProps {
  subtotal: number
  discountTotal: number
  shippingTotal: number
  taxTotal: number
  total: number
  currency: string
}

function OrderSummaryCard({ subtotal, discountTotal, shippingTotal, taxTotal, total, currency }: OrderSummaryCardProps) {
  return (
    <div className="card p-6">
      <p className="section-label">Sumar</p>
      <div className="flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between text-fg-secondary">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatMoney(subtotal, currency)}</span>
        </div>
        {discountTotal > 0 && (
          <div className="flex justify-between text-success">
            <span>Discount</span>
            <span className="tabular-nums">−{formatMoney(discountTotal, currency)}</span>
          </div>
        )}
        {shippingTotal > 0 && (
          <div className="flex justify-between text-fg-secondary">
            <span>Transport</span>
            <span className="tabular-nums">{formatMoney(shippingTotal, currency)}</span>
          </div>
        )}
        {taxTotal > 0 && (
          <div className="flex justify-between text-fg-secondary">
            <span>TVA</span>
            <span className="tabular-nums">{formatMoney(taxTotal, currency)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-border-subtle pt-3 font-semibold text-fg-primary">
          <span>Total</span>
          <span className="tabular-nums">{formatMoney(total, currency)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummaryCard
