import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { PLAN_CONFIG } from '@merx/types'
import { getAccessToken, getActiveSubscriptionApi } from '@/features/account/services/billing.api'
import { PlanChangeConfirm } from '@/features/checkout/components/PlanChangeConfirm'
import { buildPlanChangeProps, buildPlanTranslations, formatRenewsAt, isPlanId } from '@/features/checkout/utils'

interface PlanChangePageProps {
  searchParams: Promise<{ planId?: string; currentPlanId?: string }>
}

export default async function PlanChangePage({ searchParams }: PlanChangePageProps) {
  const { planId, currentPlanId } = await searchParams
  if (!planId || !currentPlanId || !isPlanId(planId) || !isPlanId(currentPlanId) || planId === currentPlanId) {
    redirect('/account/subscription')
  }

  const newPlan = PLAN_CONFIG[planId]
  const currentPlan = PLAN_CONFIG[currentPlanId]

  if (newPlan.price === null || currentPlan.price === null) redirect('/account/subscription')

  const accessToken = await getAccessToken()
  if (!accessToken) redirect('/login')

  const activeSub = await getActiveSubscriptionApi(accessToken)
  if (!activeSub) redirect('/account/subscription')

  const locale = await getLocale()
  const tPlans = await getTranslations('pricing.plans')
  const { descriptions, rawFeatures } = buildPlanTranslations(tPlans)
  const renewsAtFormatted = formatRenewsAt(activeSub.renewsAt, locale)

  const props = buildPlanChangeProps({
    currentPlan,
    newPlan,
    curId: currentPlanId,
    nxtId: planId,
    isUpgrade: newPlan.price > currentPlan.price,
    renewsAtFormatted,
    descriptions,
    rawFeatures,
  })

  return (
    <PlanChangeConfirm
      planId={planId}
      {...props}
    />
  )
}
