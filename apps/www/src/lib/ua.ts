export function parseUA(ua: string | null): { label: string; isMobile: boolean } {
  if (!ua) return { label: 'Unknown browser', isMobile: false }

  const isMobile = /Mobile|Android|iPhone|iPad/.test(ua)

  let browser = 'Unknown browser'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera\//.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua) && !/Chromium\//.test(ua)) browser = 'Chrome'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'Safari'

  let os = ''
  if (/iPhone/.test(ua)) os = 'iPhone'
  else if (/iPad/.test(ua)) os = 'iPad'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/Windows/.test(ua)) os = 'Windows'
  else if (/Mac OS/.test(ua)) os = 'macOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  return { label: os ? `${browser} on ${os}` : browser, isMobile }
}
