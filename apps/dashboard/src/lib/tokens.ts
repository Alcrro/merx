const KEYS = { access: 'merx_access', refresh: 'merx_refresh' } as const

export const tokens = {
  getAccess: () => localStorage.getItem(KEYS.access),
  getRefresh: () => localStorage.getItem(KEYS.refresh),
  set: (access: string, refresh: string) => {
    localStorage.setItem(KEYS.access, access)
    localStorage.setItem(KEYS.refresh, refresh)
  },
  clear: () => {
    localStorage.removeItem(KEYS.access)
    localStorage.removeItem(KEYS.refresh)
  },
}
