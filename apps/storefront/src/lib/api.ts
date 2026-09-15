// Server-side: absolute URL straight to Express (no hop through Next.js proxy)
// Client-side: relative URL, proxied by Next.js rewrites → Express
const baseUrl =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? 'http://localhost:3001')
    : ''

const BASE = `${baseUrl}/api/v1/storefront`

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PublicStore {
  id: string
  name: string
  slug: string
  currency: string
  locale: string
  canonicalHost: string | null
}

export function storeCanonicalOrigin(store: Pick<PublicStore, 'slug' | 'canonicalHost'>): string {
  return store.canonicalHost ? `https://${store.canonicalHost}` : `https://${store.slug}.merx.com`
}

export function formatTitle(pageTitle: string, template: string): string {
  return template.includes('%s') ? template.replace('%s', pageTitle) : `${pageTitle} ${template}`.trim()
}

export interface PublicVariant {
  id: string
  sku: string
  title: string
  price: number
  compareAtPrice: number | null
  inventory: number | null
}

export interface PublicProduct {
  id: string
  title: string
  description: string | null
  productType: string | null
  vendor: string | null
  category: { id: string; name: string; slug: string } | null
  variants: PublicVariant[]
  createdAt: string
}

export interface PublicCategory {
  id: string
  name: string
  slug: string
}

export interface PaginatedProducts {
  data: PublicProduct[]
  total: number
  page: number
  limit: number
}

export interface CheckoutPayload {
  email: string
  firstName: string
  lastName: string
  items: { variantId: string; quantity: number }[]
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    country: string
    postalCode: string
  }
  discountCode?: string
}

export interface OrderConfirmation {
  customerEmail: string | null
  amountTotal: number
  discountTotal: number | null
  currency: string
  status: string
  discountCodeSnapshot: string | null
}

export interface DiscountValidationResult {
  valid: boolean
  reason?: string
  minimumAmount?: number
  discount?: {
    type: 'percentage' | 'fixed'
    value: number
    calculatedAmount: number
    currency: string
  }
}

// ─── API calls ───────────────────────────────────────────────────────────────

export const storefrontApi = {
  getStore: (slug: string) =>
    apiFetch<PublicStore>(`${BASE}/${slug}`),

  listProducts: (
    slug: string,
    params?: { page?: number; limit?: number; categoryId?: string },
  ) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.categoryId) q.set('categoryId', params.categoryId)
    return apiFetch<PaginatedProducts>(`${BASE}/${slug}/products?${q}`)
  },

  getProduct: (slug: string, productId: string) =>
    apiFetch<PublicProduct>(`${BASE}/${slug}/products/${productId}`),

  listCategories: (slug: string) =>
    apiFetch<PublicCategory[]>(`${BASE}/${slug}/categories`),

  checkout: (slug: string, payload: CheckoutPayload) =>
    apiFetch<{ url: string }>(`${BASE}/${slug}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  getOrderConfirmation: (slug: string, sessionId: string) =>
    apiFetch<OrderConfirmation>(
      `${BASE}/${slug}/order-confirmation?session_id=${encodeURIComponent(sessionId)}`,
    ),

  validateDiscount: (slug: string, code: string, subtotal: number) =>
    apiFetch<DiscountValidationResult>(`${BASE}/${slug}/discounts/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    }),
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency }).format(amount)
}
