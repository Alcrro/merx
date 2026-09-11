type PlausibleProps = Record<string, string | number | boolean>

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: PlausibleProps }) => void
  }
}

export function trackEvent(event: string, props?: PlausibleProps) {
  if (typeof window === 'undefined') return
  if (typeof window.plausible !== 'function') return
  window.plausible(event, { props })
}
