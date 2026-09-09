export function orderSlug(orderNumber: number, createdAt: string | Date): string {
  const d = new Date(createdAt)
  const date = d.toISOString().slice(0, 10).replace(/-/g, '')
  return `ORD-${String(orderNumber).padStart(4, '0')}-${date}`
}

export function parseOrderSlug(slug: string): { orderNumber: number } | null {
  const m = slug.match(/^ORD-(\d+)-\d{8}$/)
  if (!m) return null
  return { orderNumber: parseInt(m[1], 10) }
}
