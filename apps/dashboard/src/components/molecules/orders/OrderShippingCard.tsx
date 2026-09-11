interface OrderShippingCardProps {
  shippingLines: string[]
}

function OrderShippingCard({ shippingLines }: OrderShippingCardProps) {
  return (
    <div className="card p-6">
      <p className="section-label">Adresă livrare</p>
      <div className="flex flex-col gap-1">
        {shippingLines.map((line) => (
          <p key={line} className="text-sm text-fg-secondary">{line}</p>
        ))}
      </div>
    </div>
  )
}

export default OrderShippingCard
