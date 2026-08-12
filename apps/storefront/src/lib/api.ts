const BASE = '/api/v1/storefront'

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

export interface PublicStore {
  id: string
  name: string
  slug: string
  currency: string
  locale: string
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
}

export interface OrderConfirmation {
  customerEmail: string | null
  amountTotal: number
  currency: string
  status: string
}

export const storefrontApi = {
  getStore: (slug: string) => get<PublicStore>(`${BASE}/${slug}`),

  listProducts: (slug: string, params?: { page?: number; limit?: number; categoryId?: string }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.categoryId) q.set('categoryId', params.categoryId)
    return get<PaginatedProducts>(`${BASE}/${slug}/products?${q}`)
  },

  getProduct: (slug: string, productId: string) =>
    get<PublicProduct>(`${BASE}/${slug}/products/${productId}`),

  listCategories: (slug: string) =>
    get<PublicCategory[]>(`${BASE}/${slug}/categories`),

  checkout: (slug: string, payload: CheckoutPayload) =>
    post<{ url: string }>(`${BASE}/${slug}/checkout`, payload),

  getOrderConfirmation: (slug: string, sessionId: string) =>
    get<OrderConfirmation>(`${BASE}/${slug}/order-confirmation?session_id=${sessionId}`),
}
