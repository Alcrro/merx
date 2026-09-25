import type { PlanId, PlanConfig } from '@merx/types'

export type FeatureType = 'check' | 'upgrade' | 'downgrade' | 'removed' | 'neutral'
export type ChangeType = 'upgrade' | 'downgrade'

export interface PlanFeature {
  type: FeatureType
  value?: string
  label: string
}

export interface RawFeature {
  label: string
  value: string
}

export interface BuildPlanChangePropsInput {
  currentPlan: PlanConfig
  newPlan: PlanConfig
  curId: PlanId
  nxtId: PlanId
  isUpgrade: boolean
  renewsAtFormatted: string
  descriptions: Record<PlanId, string>
  rawFeatures: Record<PlanId, RawFeature[]>
}
