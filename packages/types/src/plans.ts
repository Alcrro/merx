export type PlanId = 'starter' | 'pro' | 'scale' | 'enterprise'

export type AnalyticsLevel = 'basic' | 'full' | 'full_csv' | 'custom'
export type SupportLevel = 'email' | 'email_chat' | 'priority' | 'dedicated_sla'

export interface PlanLimits {
  monthlyOrders: number | null  // null = unlimited
  products: number | null       // null = unlimited
  aiMessages: number | null     // null = unlimited
}

export interface PlanCapabilities {
  analyticsLevel: AnalyticsLevel
  supportLevel: SupportLevel
  csvExport: boolean
  prioritySupport: boolean
  dedicatedSla: boolean
}

export interface PlanConfig {
  id: PlanId
  name: string
  price: number | null      // null = contact/custom pricing
  trialDays: number | null  // null = no trial
  highlight: boolean
  limits: PlanLimits
  capabilities: PlanCapabilities
}

export const PLAN_CONFIG = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 19,
    trialDays: 14,
    highlight: false,
    limits: {
      monthlyOrders: 200,
      products: 500,
      aiMessages: 500,
    },
    capabilities: {
      analyticsLevel: 'basic',
      supportLevel: 'email',
      csvExport: false,
      prioritySupport: false,
      dedicatedSla: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 49,
    trialDays: null,
    highlight: true,
    limits: {
      monthlyOrders: 2000,
      products: null,
      aiMessages: 3000,
    },
    capabilities: {
      analyticsLevel: 'full',
      supportLevel: 'email_chat',
      csvExport: false,
      prioritySupport: false,
      dedicatedSla: false,
    },
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    price: 129,
    trialDays: null,
    highlight: false,
    limits: {
      monthlyOrders: null,
      products: null,
      aiMessages: null,
    },
    capabilities: {
      analyticsLevel: 'full_csv',
      supportLevel: 'priority',
      csvExport: true,
      prioritySupport: true,
      dedicatedSla: false,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    trialDays: null,
    highlight: false,
    limits: {
      monthlyOrders: null,
      products: null,
      aiMessages: null,
    },
    capabilities: {
      analyticsLevel: 'custom',
      supportLevel: 'dedicated_sla',
      csvExport: true,
      prioritySupport: true,
      dedicatedSla: true,
    },
  },
} satisfies Record<PlanId, PlanConfig>

export const PLANS = Object.values(PLAN_CONFIG)
