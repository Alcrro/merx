import { Prisma } from '@prisma/client'
import { prisma } from '../../../../../lib/prisma'
import type { IBillingAccountRepository } from '../../../domain/ports/billing-account.repository.port'
import type { ApplyPlanStateResult, BillingAccount, PlanState } from '../../../domain/types'

// processed_stripe_events is shared with the storefront webhook — namespace billing keys.
const EVENT_KEY_PREFIX = 'billing:'

export class BillingAccountRepository implements IBillingAccountRepository {
  async findById(userId: string): Promise<BillingAccount | null> {
    const row = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, stripeCustomerId: true },
    })
    if (!row) return null
    return { userId: row.id, email: row.email, name: row.name, stripeCustomerId: row.stripeCustomerId }
  }

  async setStripeCustomerId(userId: string, customerId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
      select: { id: true },
    })
  }

  async applyPlanState(
    event: { eventId: string; eventType: string },
    customerId: string,
    state: PlanState,
  ): Promise<ApplyPlanStateResult> {
    try {
      await prisma.$transaction([
        prisma.processedStripeEvent.create({
          data: { eventId: `${EVENT_KEY_PREFIX}${event.eventId}`, type: event.eventType },
        }),
        prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { planStatus: state.planStatus, ...(state.planId && { planId: state.planId }) },
        }),
      ])
      return 'applied'
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') return 'duplicate'
      throw err
    }
  }
}
