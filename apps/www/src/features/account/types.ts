export type AccountActionResult =
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

export type AccountActionState = AccountActionResult | null

export interface PlanFeature {
  label: string
  value: string
}

export interface Session {
  id: string
  createdAt: Date
  isCurrent: boolean
  userAgent: string | null
  ip: string | null
}
