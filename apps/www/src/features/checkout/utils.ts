import { PLAN_CONFIG } from '@merx/types'
import type { PlanId } from '@merx/types'
import { ANALYTICS_RANK, SUPPORT_RANK } from './config'
import type { BuildPlanChangePropsInput, ChangeType, FeatureType, PlanFeature, RawFeature } from './types'

interface PlansTFunction {
  (key: string): string
  raw: (key: string) => unknown
}

const PLAN_IDS: PlanId[] = ['starter', 'pro', 'scale', 'enterprise']

export function isPlanId(id: string): id is PlanId {
  return id in PLAN_CONFIG
}

export function buildPlanTranslations(tPlans: PlansTFunction): {
  descriptions: Record<PlanId, string>
  rawFeatures: Record<PlanId, RawFeature[]>
} {
  return {
    descriptions: Object.fromEntries(
      PLAN_IDS.map((id) => [id, tPlans(`${id}.description`)])
    ) as Record<PlanId, string>,
    rawFeatures: Object.fromEntries(
      PLAN_IDS.map((id) => [id, tPlans.raw(`${id}.features`)])
    ) as Record<PlanId, RawFeature[]>,
  }
}

export function formatRenewsAt(renewsAt: number, locale: string): string {
  return new Date(renewsAt * 1000).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function buildPlanChangeProps({
  currentPlan,
  newPlan,
  curId,
  nxtId,
  isUpgrade,
  renewsAtFormatted,
  descriptions,
  rawFeatures,
}: BuildPlanChangePropsInput) {
  if (currentPlan.price === null || newPlan.price === null) {
    throw new Error('Plans must have a price to compare')
  }
  const currentFeatures: PlanFeature[] = rawFeatures[curId].map((f) => ({
    type: 'check',
    value: f.value,
    label: f.label,
  }))

  const featureTypes: FeatureType[] = [
    compareLimit(currentPlan.limits.monthlyOrders, newPlan.limits.monthlyOrders),
    compareLimit(currentPlan.limits.products, newPlan.limits.products),
    compareLimit(currentPlan.limits.aiMessages, newPlan.limits.aiMessages),
    compareRank(
      ANALYTICS_RANK,
      currentPlan.capabilities.analyticsLevel,
      newPlan.capabilities.analyticsLevel
    ),
    compareRank(
      SUPPORT_RANK,
      currentPlan.capabilities.supportLevel,
      newPlan.capabilities.supportLevel
    ),
  ]

  const newFeatures: PlanFeature[] = rawFeatures[nxtId].map((f, i) => ({
    type: featureTypes[i] ?? 'check',
    value: f.value,
    label: f.label,
  }))

  const lostFeatures = isUpgrade
    ? []
    : currentFeatures
        .map((cur, i) => ({ cur, nxt: newFeatures[i], type: featureTypes[i] }))
        .filter(({ type }) => type === 'downgrade' || type === 'removed')
        .map(({ cur, nxt }) =>
          cur.value && nxt.value
            ? `${cur.value} → ${nxt.value} ${cur.label}`.trim()
            : cur.value
              ? `${cur.value} ${cur.label}`.trim()
              : cur.label
        )

  const changeType: ChangeType = isUpgrade ? 'upgrade' : 'downgrade'

  return {
    changeType,
    currentPlanName: currentPlan.name,
    newPlanName: newPlan.name,
    currentDescription: descriptions[curId],
    newDescription: descriptions[nxtId],
    currentPrice: currentPlan.price,
    newPrice: newPlan.price,
    renewsAtFormatted,
    currentFeatures,
    newFeatures,
    lostFeatures,
  }
}

export function compareLimit(cur: number | null, nxt: number | null): FeatureType {
  if (cur === nxt) return 'check'
  if (nxt === null) return 'upgrade'
  if (cur === null) return 'downgrade'
  return nxt > cur ? 'upgrade' : 'downgrade'
}

export function compareRank(rank: Record<string, number>, cur: string, nxt: string): FeatureType {
  const a = rank[cur] ?? 0
  const b = rank[nxt] ?? 0
  if (a === b) return 'check'
  return b > a ? 'upgrade' : 'downgrade'
}
