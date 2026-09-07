import type { NewOrderAlertData } from '../email.service'

function fmt(amount: number, currency: string): string {
  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
}

export function newOrderAlertHtml(d: NewOrderAlertData): string {
  const itemRows = d.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">${item.title}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#666;text-align:center;">×${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#111;text-align:right;">${fmt(item.unitPrice * item.quantity, d.currency)}</td>
    </tr>
  `,
    )
    .join('')

  const timestamp = new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d.createdAt)

  return `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Comandă nouă #${d.orderNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
            <td style="background:#111;padding:28px 40px;">
              <p style="margin:0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#888;">Comandă nouă</p>
              <p style="margin:6px 0 0;font-size:26px;font-weight:700;color:#fff;">#${d.orderNumber}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">

              <!-- Meta -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:0 0 12px;">
                    <p style="margin:0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#aaa;">Client</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#111;">${d.customerEmail}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;border-top:1px solid #f0f0f0;">
                    <p style="margin:0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#aaa;">Primit la</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#111;">${timestamp}</p>
                  </td>
                </tr>
              </table>

              <!-- Products -->
              <p style="margin:0 0 10px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#aaa;">Produse</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0f0f0;margin-bottom:20px;">
                <tbody>${itemRows}</tbody>
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <span style="font-size:13px;color:#666;">Total comandă</span>
                  </td>
                  <td style="padding:16px 20px;text-align:right;">
                    <span style="font-size:20px;font-weight:700;color:#111;">${fmt(d.total, d.currency)}</span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:#f9fafb;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
                ${d.storeName} · <a href="https://merx.com" style="color:#4f46e5;text-decoration:none;">Merx</a>
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
