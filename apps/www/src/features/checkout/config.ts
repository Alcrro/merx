import type { FeatureType } from './types'

export const ICON_PATHS: Record<FeatureType, string> = {
  check: 'M20 6L9 17l-5-5',
  upgrade: 'M12 19V5M5 12l7-7 7 7',
  downgrade: 'M12 5v14M5 12l7 7 7-7',
  removed: 'M18 6L6 18M6 6l12 12',
  neutral: 'M5 12h14',
}

export const ANALYTICS_RANK: Record<string, number> = {
  basic: 0,
  full: 1,
  full_csv: 2,
  custom: 3,
}

export const SUPPORT_RANK: Record<string, number> = {
  email: 0,
  email_chat: 1,
  priority: 2,
  dedicated_sla: 3,
}
