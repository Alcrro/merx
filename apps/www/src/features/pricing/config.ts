import { PLANS } from '@merx/types'

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3000'

export const PLAN_HREFS: Record<string, string> = {
  starter: `${DASHBOARD_URL}/signup`,
  pro: `${DASHBOARD_URL}/signup?plan=pro`,
  scale: `${DASHBOARD_URL}/signup?plan=scale`,
  enterprise: '/contact?topic=sales#form',
}

export const BASE_PLAN_DATA = PLANS.map((plan) => ({
  id: plan.id,
  name: plan.name,
  price: plan.price,
  highlight: plan.highlight,
  hasTrial: plan.trialDays !== null,
  href: PLAN_HREFS[plan.id] ?? '',
}))

export interface PricingFeature {
  label: string
  value: string
}

export interface PricingPlan {
  id: string
  name: string
  description: string
  price: number | null
  trial: string | null
  highlight: boolean
  features: PricingFeature[]
  cta: { label: string; href: string }
}
