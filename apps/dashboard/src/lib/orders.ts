import type { Order } from '@merx/types'

export function isOrderCancelled(order: Order): boolean {
  return order.status === 'CANCELLED'
}

export function getOrderCustomerName(order: Order): string | null {
  if (!order.customer) return null
  const name = `${order.customer.firstName ?? ''} ${order.customer.lastName ?? ''}`.trim()
  return name.length > 0 ? name : order.customer.email
}

export function formatOrderDate(order: Order): string {
  return new Date(order.createdAt).toLocaleDateString('ro-RO', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function getOrderShippingLines(order: Order): string[] {
  return order.shippingAddress ? getShippingLines(order.shippingAddress) : []
}

export function getOrderInitials(order: Order): string {
  const c = order.customer
  if (!c) return '?'
  const f = c.firstName?.[0] ?? ''
  const l = c.lastName?.[0] ?? ''
  if (f || l) return (f + l).toUpperCase()
  return c.email.slice(0, 2).toUpperCase()
}

export function getOrderCustomerLabel(order: Order): string {
  const c = order.customer
  if (!c) return 'Client necunoscut'
  const name = `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim()
  return name.length > 0 ? name : c.email
}

export function getOrderProductsLabel(order: Order): string {
  if (order.items.length === 0) return '—'
  const first = order.items[0].title
  const rest = order.items.length - 1
  return rest > 0 ? `${first} +${rest}` : first
}

export function getShippingLines(addr: Record<string, unknown>): string[] {
  const lines: string[] = []
  const street = (addr.street ?? addr.address ?? addr.line1 ?? addr.streetAddress) as string | undefined
  const city = addr.city as string | undefined
  const zip = (addr.postalCode ?? addr.zip ?? addr.postal_code) as string | undefined
  const country = addr.country as string | undefined
  if (street) lines.push(street)
  if (city && zip) lines.push(`${city}, ${zip}`)
  else if (city) lines.push(city)
  else if (zip) lines.push(zip)
  if (country) lines.push(country)
  return lines
}
