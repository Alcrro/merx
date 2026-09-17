export const TOPIC_KEYS = ['sales', 'support', 'legal', 'press', 'other'] as const
export type TopicKey = (typeof TOPIC_KEYS)[number]

export const TOPIC_EMAIL_MAP: Record<TopicKey, string> = {
  sales: 'hello@merx.com',
  support: 'support@merx.com',
  legal: 'legal@merx.com',
  press: 'press@merx.com',
  other: 'hello@merx.com',
}

export const CHANNEL_KEYS: Array<{ key: string; email: string }> = [
  { key: 'sales', email: 'hello@merx.com' },
  { key: 'support', email: 'support@merx.com' },
  { key: 'legal', email: 'legal@merx.com' },
  { key: 'press', email: 'press@merx.com' },
]

export const EMAIL_TO_CHANNEL_KEY: Record<string, string> = {
  'hello@merx.com': 'sales',
  'support@merx.com': 'support',
  'legal@merx.com': 'legal',
  'press@merx.com': 'press',
}

export interface ContactChannel {
  key: string
  label: string
  description: string
  email: string
  responseTime: string
}
