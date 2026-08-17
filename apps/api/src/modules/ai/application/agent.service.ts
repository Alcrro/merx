import type { LLMProvider, Message } from '@merx/llm-provider'
import type { IAIRepository } from '../domain/ports'
import type { AISessionEntity, AISessionWithMessages } from '../domain/entities'
import { allTools, executeTool } from '../infrastructure/tool-registry'

const MAX_TOOL_ROUNDS = 6

export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'LIMIT_EXCEEDED'
  ) {
    super(message)
    this.name = 'AIError'
  }
}

export interface StoreContext {
  name: string
  currency: string
  totalCustomers: number
  totalOrders: number
  pendingOrders: number
  revenueLast30d: number
  ordersLastMonth: number
}

function buildSystemPrompt(ctx: StoreContext): string {
  const today = new Date().toISOString().split('T')[0]
  return `You are an AI business analyst for Merx, an e-commerce platform. You help store owners understand their business data and make informed decisions.

You have access to tools that read live store data: analytics, inventory, orders, and customers. Always fetch data before making claims — never guess numbers.

Guidelines:
- Explain what the data means in plain language, not just raw numbers.
- Highlight important patterns, risks, or opportunities.
- When you spot an issue (e.g., out-of-stock products, declining revenue), say it clearly.
- Suggest concrete next steps when relevant.
- Be direct and concise. The merchant's time is valuable.
- To look up a specific customer, use get_customer_summary with their email or ID.

Store: ${ctx.name}
Currency: ${ctx.currency}
Today: ${today}

Store snapshot (live):
- Total customers: ${ctx.totalCustomers}
- Total orders (all time): ${ctx.totalOrders}
- Orders last 30 days: ${ctx.ordersLastMonth}
- Revenue last 30 days: ${ctx.revenueLast30d.toFixed(2)} ${ctx.currency}
- Pending orders (unfulfilled): ${ctx.pendingOrders}`
}

export class AgentService {
  constructor(
    private readonly repo: IAIRepository,
    private readonly llm: LLMProvider
  ) {}

  async createSession(storeId: string, userId: string, title?: string): Promise<AISessionEntity> {
    return this.repo.createSession({ storeId, userId, title })
  }

  async listSessions(storeId: string): Promise<AISessionEntity[]> {
    return this.repo.listSessions(storeId)
  }

  async getSession(sessionId: string, storeId: string): Promise<AISessionWithMessages> {
    const session = await this.repo.getSession(sessionId, storeId)
    if (!session) throw new AIError('Session not found', 'NOT_FOUND')
    return session
  }

  async deleteSession(sessionId: string, storeId: string): Promise<void> {
    const session = await this.repo.getSession(sessionId, storeId)
    if (!session) throw new AIError('Session not found', 'NOT_FOUND')
    await this.repo.deleteSession(sessionId, storeId)
  }

  async chat(
    sessionId: string,
    storeId: string,
    storeContext: StoreContext,
    userContent: string
  ): Promise<string> {
    const session = await this.repo.getSession(sessionId, storeId)
    if (!session) throw new AIError('Session not found', 'NOT_FOUND')

    const history: Message[] = await this.repo.getMessages(sessionId)
    const userMessage: Message = { role: 'user', content: userContent }
    const newMessages: Message[] = [userMessage]

    const systemPrompt = buildSystemPrompt(storeContext)
    let conversationTail = [...history, userMessage]

    let finalContent = ''

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await this.llm.chat(
        [{ role: 'system', content: systemPrompt }, ...conversationTail],
        { tools: allTools }
      )

      if (!response.toolCalls?.length) {
        finalContent = response.content ?? ''
        newMessages.push({ role: 'assistant', content: finalContent })
        break
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: response.content,
        toolCalls: response.toolCalls,
      }
      newMessages.push(assistantMsg)
      conversationTail = [...conversationTail, assistantMsg]

      for (const call of response.toolCalls) {
        const result = await executeTool(call.name, storeId, call.arguments)
        const toolMsg: Message = {
          role: 'tool',
          content: result,
          toolCallId: call.id,
        }
        newMessages.push(toolMsg)
        conversationTail = [...conversationTail, toolMsg]
      }
    }

    await this.repo.saveMessages(sessionId, newMessages)

    if (!session.title && history.length === 0) {
      const shortTitle = userContent.slice(0, 60)
      await this.repo.updateSessionTitle(sessionId, shortTitle)
    }

    return finalContent
  }

  async *stream(
    sessionId: string,
    storeId: string,
    storeContext: StoreContext,
    userContent: string
  ): AsyncGenerator<{ type: 'tool_call'; name: string } | { type: 'text'; content: string } | { type: 'done' }> {
    const session = await this.repo.getSession(sessionId, storeId)
    if (!session) throw new AIError('Session not found', 'NOT_FOUND')

    const history: Message[] = await this.repo.getMessages(sessionId)
    const userMessage: Message = { role: 'user', content: userContent }
    const newMessages: Message[] = [userMessage]

    const systemPrompt = buildSystemPrompt(storeContext)
    let conversationTail = [...history, userMessage]

    // Resolve all tool calls first (non-streaming), then stream the final text
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await this.llm.chat(
        [{ role: 'system', content: systemPrompt }, ...conversationTail],
        { tools: allTools }
      )

      if (!response.toolCalls?.length) {
        newMessages.push({ role: 'assistant', content: response.content })
        await this.repo.saveMessages(sessionId, newMessages)

        if (!session.title && history.length === 0) {
          await this.repo.updateSessionTitle(sessionId, userContent.slice(0, 60))
        }

        // Stream the final response
        for (const chunk of splitIntoChunks(response.content ?? '')) {
          yield { type: 'text', content: chunk }
        }
        yield { type: 'done' }
        return
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: response.content,
        toolCalls: response.toolCalls,
      }
      newMessages.push(assistantMsg)
      conversationTail = [...conversationTail, assistantMsg]

      for (const call of response.toolCalls) {
        yield { type: 'tool_call', name: call.name }
        const result = await executeTool(call.name, storeId, call.arguments)
        const toolMsg: Message = { role: 'tool', content: result, toolCallId: call.id }
        newMessages.push(toolMsg)
        conversationTail = [...conversationTail, toolMsg]
      }
    }

    yield { type: 'done' }
  }
}

function splitIntoChunks(text: string, size = 20): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size))
  }
  return chunks
}
