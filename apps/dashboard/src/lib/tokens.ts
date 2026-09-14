const KEYS = { access: 'merx_access', refresh: 'merx_refresh', slug: 'merx_slug' } as const

export const tokens = {
  getAccess: () => localStorage.getItem(KEYS.access),
  getRefresh: () => localStorage.getItem(KEYS.refresh),
  getSlug: () => localStorage.getItem(KEYS.slug),
  set: (access: string, refresh: string, slug: string) => {
    localStorage.setItem(KEYS.access, access)
    localStorage.setItem(KEYS.refresh, refresh)
    localStorage.setItem(KEYS.slug, slug)
  },
  setRefresh: (refresh: string) => localStorage.setItem(KEYS.refresh, refresh),
  clear: () => {
    localStorage.removeItem(KEYS.access)
    localStorage.removeItem(KEYS.refresh)
    localStorage.removeItem(KEYS.slug)
  },
}
