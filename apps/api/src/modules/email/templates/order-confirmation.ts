export interface ShippingAddress {
  name?: string | null
  line1?: string | null
  line2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
}

export interface OrderConfirmationData {
  orderNumber: number
  storeName: string
  customerEmail: string
  merchantEmail?: string | null
  shippingAddress?: ShippingAddress | null
  items: Array<{ title: string; sku?: string | null; quantity: number; unitPrice: number; total: number }>
  subtotal: number
  discountTotal: number
  shippingTotal: number
  taxTotal: number
  total: number
  currency: string
}

function fmt(amount: number, currency: string): string {
  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
}

function buildAddressSection(a: ShippingAddress): string {
  const lines = [
    a.name,
    a.line1,
    a.line2,
    [a.city, a.postalCode].filter(Boolean).join(', '),
    a.state,
    a.country,
  ].filter(Boolean)

  if (lines.length === 0) return ''

  return `
    <div style="margin:24px 0 0;padding:16px;background:#f9fafb;border-radius:8px;border:1px solid #f0f0f0;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;color:#888;letter-spacing:.05em;">Adresă livrare</p>
      ${lines.map((l) => `<p style="margin:0;font-size:13px;color:#444;line-height:1.6;">${l}</p>`).join('')}
    </div>
  `
}

export function orderConfirmationHtml(d: OrderConfirmationData): string {
  const addressSection = d.shippingAddress ? buildAddressSection(d.shippingAddress) : ''

  const itemRows = d.items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
        <span style="font-size:14px;color:#111;">${item.title}</span>
        ${item.sku ? `<br><span style="font-size:12px;color:#888;font-family:monospace;">${item.sku}</span>` : ''}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:center;font-size:14px;color:#555;">×${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;font-weight:600;color:#111;">${fmt(item.total, d.currency)}</td>
    </tr>
  `).join('')

  const summaryRows = [
    { label: 'Subtotal', value: fmt(d.subtotal, d.currency), show: true },
    { label: 'Discount', value: `−${fmt(d.discountTotal, d.currency)}`, show: d.discountTotal > 0 },
    { label: 'Transport', value: d.shippingTotal > 0 ? fmt(d.shippingTotal, d.currency) : 'Gratuit', show: true },
    { label: 'TVA', value: fmt(d.taxTotal, d.currency), show: d.taxTotal > 0 },
  ]
    .filter((r) => r.show)
    .map((r) => `
      <tr>
        <td style="padding:5px 0;font-size:13px;color:#666;">${r.label}</td>
        <td style="padding:5px 0;font-size:13px;color:#555;text-align:right;">${r.value}</td>
      </tr>
    `).join('')

  return `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Confirmare comandă #${d.orderNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
            <td style="background:#4f46e5;padding:32px 40px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#fff;">${d.storeName}</p>
              <p style="margin:8px 0 0;font-size:14px;color:#c7d2fe;">Comandă confirmată</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 6px;font-size:24px;font-weight:700;color:#111;">Mulțumim pentru comandă!</p>
              <p style="margin:0 0 24px;font-size:14px;color:#555;">Comanda ta <strong>#${d.orderNumber}</strong> a fost primită și confirmată.</p>

              <!-- Products -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #f0f0f0;margin-bottom:20px;">
                <thead>
                  <tr>
                    <th style="padding:10px 0;font-size:12px;font-weight:600;text-transform:uppercase;color:#888;text-align:left;">Produs</th>
                    <th style="padding:10px 0;font-size:12px;font-weight:600;text-transform:uppercase;color:#888;text-align:center;">Cantitate</th>
                    <th style="padding:10px 0;font-size:12px;font-weight:600;text-transform:uppercase;color:#888;text-align:right;">Total</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>

              <!-- Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0f0f0;margin-bottom:24px;">
                <tbody>
                  ${summaryRows}
                  <tr>
                    <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#111;border-top:2px solid #111;margin-top:8px;">Total</td>
                    <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#111;text-align:right;border-top:2px solid #111;">${fmt(d.total, d.currency)}</td>
                  </tr>
                </tbody>
              </table>

              ${addressSection}

              <p style="margin:24px 0 0;font-size:13px;color:#888;">Ai întrebări? Răspunde la acest email sau contactează <strong>${d.storeName}</strong>.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:#f9fafb;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
                Alimentat de <a href="https://merx.com" style="color:#4f46e5;text-decoration:none;">Merx</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
