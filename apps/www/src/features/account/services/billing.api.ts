import { config } from '@/config'
import { AppError } from '@/errors/app.error'
import { ErrorCode } from '@/errors/codes'

export interface BillingCard {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

export interface BillingInvoice {
  id: string
  number: string | null
  date: number
  amount: number
  currency: string
  status: 'paid' | 'open' | 'void' | 'uncollectible'
  pdfUrl: string | null
}

export interface ActiveSubscription {
  subscriptionId: string
  itemId: string
  planName: string
  priceId: string
  priceAmount: number
  currency: string
  interval: string
  startsAt: number
  renewsAt: number
  cancelAtPeriodEnd: boolean
}

async function billingFetch(
  path: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${config.api.url}/api/v1/billing${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers as Record<string, string> | undefined),
    },
    signal: AbortSignal.timeout(10000),
  })
}

const BILLING_ERROR_MESSAGES: Record<number, string> = {
  400: 'Plan invalid.',
  401: 'Sesiunea a expirat. Reconectează-te.',
  404: 'Nu există un abonament activ.',
  409: 'Schimbarea nu e posibilă acum: ești deja pe acest plan sau ai deja o schimbare de plan programată.',
}

function ensureOk(res: Response): void {
  if (res.ok) return
  throw new AppError(
    `Billing API ${res.status} ${res.url}`,
    BILLING_ERROR_MESSAGES[res.status] ?? 'A apărut o eroare. Încearcă din nou.',
    ErrorCode.BILLING_REQUEST_FAILED,
    res.status
  )
}

export async function getActiveSubscriptionApi(
  accessToken: string
): Promise<ActiveSubscription | null> {
  const res = await billingFetch('/subscription', accessToken)
  if (!res.ok) return null
  const data = (await res.json()) as { subscription: ActiveSubscription | null }
  return data.subscription
}

export async function cancelSubscriptionApi(accessToken: string): Promise<void> {
  const res = await billingFetch('/subscription/cancel', accessToken, { method: 'POST', body: '{}' })
  ensureOk(res)
}

export async function undoCancelSubscriptionApi(accessToken: string): Promise<void> {
  const res = await billingFetch('/subscription/undo', accessToken, { method: 'POST', body: '{}' })
  ensureOk(res)
}

export async function upgradeSubscriptionApi(accessToken: string, planId: string): Promise<void> {
  const res = await billingFetch('/subscription/upgrade', accessToken, {
    method: 'POST',
    body: JSON.stringify({ planId }),
  })
  ensureOk(res)
}

export async function getPaymentMethodsApi(accessToken: string): Promise<BillingCard[]> {
  const res = await billingFetch('/payment-methods', accessToken)
  if (!res.ok) return []
  const data = (await res.json()) as { paymentMethods: BillingCard[] }
  return data.paymentMethods
}

export async function createPortalSessionApi(accessToken: string): Promise<string | null> {
  const res = await billingFetch('/portal', accessToken, { method: 'POST', body: '{}' })
  if (!res.ok) return null
  const data = (await res.json()) as { url: string }
  return data.url
}

export async function createCheckoutSessionApi(
  accessToken: string,
  planId: string
): Promise<string | null> {
  const res = await billingFetch('/checkout', accessToken, {
    method: 'POST',
    body: JSON.stringify({ planId }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { url: string }
  return data.url
}

export async function getInvoicesApi(accessToken: string): Promise<BillingInvoice[]> {
  const res = await billingFetch('/invoices', accessToken)
  if (!res.ok) return []
  const data = (await res.json()) as { invoices: BillingInvoice[] }
  return data.invoices
}

export { getAccessToken } from '@/lib/auth/access-token'
