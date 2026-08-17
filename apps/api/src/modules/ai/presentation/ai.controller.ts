import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../../middleware/authenticate'
import { AgentService, AIError, StoreContext } from '../application/agent.service'
import { aiRepository } from '../infrastructure/ai.repository'
import { OpenAIProvider } from '@merx/llm-provider'
import { prisma } from '../../../lib/prisma'
import { runInsightsForStore } from '../infrastructure/insights.job'
import { createSessionSchema, chatMessageSchema, restockSchema } from './ai.schema'

const agentService = new AgentService(aiRepository, new OpenAIProvider())

async function getStoreContext(storeId: string): Promise<StoreContext> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [store, totalCustomers, totalOrders, pendingOrders, recentOrders] = await Promise.all([
    prisma.store.findUnique({ where: { id: storeId }, select: { name: true, currency: true } }),
    prisma.customer.count({ where: { storeId } }),
    prisma.order.count({ where: { storeId } }),
    prisma.order.count({ where: { storeId, fulfillmentStatus: 'unfulfilled', paymentStatus: 'paid' } }),
    prisma.order.findMany({
      where: { storeId, paymentStatus: 'paid', createdAt: { gte: thirtyDaysAgo } },
      select: { total: true },
    }),
  ])

  const revenueLast30d = recentOrders.reduce((sum, o) => sum + Number(o.total), 0)

  return {
    name: store?.name ?? 'Store',
    currency: store?.currency ?? 'EUR',
    totalCustomers,
    totalOrders,
    pendingOrders,
    revenueLast30d: Math.round(revenueLast30d * 100) / 100,
    ordersLastMonth: recentOrders.length,
  }
}

export const aiController = {
  createSession: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const body = createSessionSchema.parse(req.body)
    const session = await agentService.createSession(req.user.storeId, req.user.userId, body.title)
    res.status(201).json(session)
  },

  listSessions: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const sessions = await agentService.listSessions(req.user.storeId)
    res.json(sessions)
  },

  getSession: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const session = await agentService.getSession(req.params.id!, req.user.storeId)
      res.json(session)
    } catch (err) {
      if (err instanceof AIError && err.code === 'NOT_FOUND') {
        res.status(404).json({ error: 'Session not found' })
        return
      }
      throw err
    }
  },

  deleteSession: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      await agentService.deleteSession(req.params.id!, req.user.storeId)
      res.status(204).send()
    } catch (err) {
      if (err instanceof AIError && err.code === 'NOT_FOUND') {
        res.status(404).json({ error: 'Session not found' })
        return
      }
      throw err
    }
  },

  chat: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const body = chatMessageSchema.parse(req.body)
    try {
      const ctx = await getStoreContext(req.user.storeId)
      const reply = await agentService.chat(
        req.params.id!,
        req.user.storeId,
        ctx,
        body.message
      )
      res.json({ reply })
    } catch (err) {
      if (err instanceof AIError && err.code === 'NOT_FOUND') {
        res.status(404).json({ error: 'Session not found' })
        return
      }
      throw err
    }
  },

  listInsights: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const insights = await prisma.aIInsight.findMany({
      where: { storeId: req.user.storeId, status: 'active' },
      orderBy: [
        { severity: 'asc' },  // critical first (c < i < w alphabetically won't work — sort by map below)
        { createdAt: 'desc' },
      ],
    })
    // Re-sort: critical → warning → info
    const order = { critical: 0, warning: 1, info: 2 }
    insights.sort((a, b) => (order[a.severity as keyof typeof order] ?? 3) - (order[b.severity as keyof typeof order] ?? 3))
    res.json(insights)
  },

  listInsightsHistory: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const insights = await prisma.aIInsight.findMany({
      where: { storeId: req.user.storeId, status: 'resolved' },
      orderBy: { resolvedAt: 'desc' },
      take: 50,
    })
    res.json(insights)
  },

  runInsights: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const count = await runInsightsForStore(req.user.storeId)
    res.json({ generated: count })
  },

  restockInsight: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { quantity } = restockSchema.parse(req.body)
    const insightId = req.params.insightId!

    const insight = await prisma.aIInsight.findUnique({ where: { id: insightId } })
    if (!insight || insight.storeId !== req.user.storeId) {
      res.status(404).json({ error: 'Insight not found' })
      return
    }
    if (insight.status !== 'active') {
      res.status(400).json({ error: 'Insight already resolved' })
      return
    }

    const data = insight.data as { productId?: string } | null
    const productId = data?.productId
    if (!productId) {
      res.status(400).json({ error: 'No product linked to insight' })
      return
    }

    const items = await prisma.inventoryItem.findMany({
      where: {
        storeId: req.user.storeId,
        variant: { productId },
      },
      select: { id: true, variantId: true, quantity: true },
    })

    if (items.length === 0) {
      res.status(400).json({ error: 'No inventory items found for this product' })
      return
    }

    const perItem = Math.floor(quantity / items.length)
    const remainder = quantity % items.length

    await prisma.$transaction([
      ...items.map((item, i) => {
        const add = perItem + (i === 0 ? remainder : 0)
        return prisma.inventoryItem.update({
          where: { id: item.id },
          data: { quantity: { increment: add } },
        })
      }),
      ...items.map((item, i) => {
        const add = perItem + (i === 0 ? remainder : 0)
        return prisma.inventoryMovement.create({
          data: {
            storeId: req.user.storeId,
            variantId: item.variantId,
            type: 'purchase',
            quantity: add,
            note: `Reaprovizionare din insight AI (${insight.title})`,
            actorType: 'user',
          },
        })
      }),
      prisma.aIInsight.update({
        where: { id: insightId },
        data: { status: 'resolved', resolvedAt: new Date() },
      }),
    ])

    res.json({ ok: true, updatedItems: items.length, totalAdded: quantity })
  },

  stream: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const body = chatMessageSchema.parse(req.body)

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const send = (data: unknown) => res.write(`data: ${JSON.stringify(data)}\n\n`)

    try {
      const ctx = await getStoreContext(req.user.storeId)
      const generator = agentService.stream(req.params.id!, req.user.storeId, ctx, body.message)
      for await (const chunk of generator) {
        send(chunk)
      }
    } catch (err) {
      if (err instanceof AIError && err.code === 'NOT_FOUND') {
        send({ type: 'error', error: 'Session not found' })
      } else {
        send({ type: 'error', error: 'Agent error' })
      }
    } finally {
      res.end()
    }
  },
}
