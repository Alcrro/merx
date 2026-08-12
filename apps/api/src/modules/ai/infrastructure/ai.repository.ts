import { Prisma } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import type { IAIRepository, CreateSessionData } from '../domain/ports'
import type { AISessionEntity, AIMessageEntity, AISessionWithMessages } from '../domain/entities'
import type { Message, ToolCall } from '@merx/llm-provider'

function toMessageEntity(m: {
  id: string
  sessionId: string
  role: string
  content: string | null
  toolCalls: unknown
  toolName: string | null
  createdAt: Date
}): AIMessageEntity {
  return {
    id: m.id,
    sessionId: m.sessionId,
    role: m.role as AIMessageEntity['role'],
    content: m.content,
    toolCalls: m.toolCalls as AIMessageEntity['toolCalls'],
    toolName: m.toolName,
    createdAt: m.createdAt,
  }
}

function toLLMMessage(m: {
  role: string
  content: string | null
  toolCalls: unknown
  toolName: string | null
}): Message {
  const base = {
    role: m.role as Message['role'],
    content: m.content,
  }
  if (m.role === 'tool') {
    return { ...base, toolCallId: m.toolName ?? undefined }
  }
  if (m.role === 'assistant' && m.toolCalls) {
    return { ...base, toolCalls: m.toolCalls as ToolCall[] }
  }
  return base
}

export const aiRepository: IAIRepository = {
  async createSession(data: CreateSessionData): Promise<AISessionEntity> {
    return prisma.aISession.create({
      data: { storeId: data.storeId, userId: data.userId, title: data.title ?? null },
    })
  },

  async listSessions(storeId: string): Promise<AISessionEntity[]> {
    return prisma.aISession.findMany({
      where: { storeId },
      orderBy: { updatedAt: 'desc' },
    })
  },

  async getSession(sessionId: string, storeId: string): Promise<AISessionWithMessages | null> {
    const session = await prisma.aISession.findFirst({
      where: { id: sessionId, storeId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
    if (!session) return null
    return { ...session, messages: session.messages.map(toMessageEntity) }
  },

  async deleteSession(sessionId: string, storeId: string): Promise<void> {
    await prisma.aISession.deleteMany({ where: { id: sessionId, storeId } })
  },

  async saveMessages(sessionId: string, messages: Message[]): Promise<void> {
    await prisma.aIMessage.createMany({
      data: messages.map((m) => ({
        sessionId,
        role: m.role,
        content: m.content ?? null,
        toolCalls: m.toolCalls ? (JSON.parse(JSON.stringify(m.toolCalls)) as Prisma.InputJsonValue) : undefined,
        toolName: m.role === 'tool' ? (m.toolCallId ?? null) : null,
      })),
    })
  },

  async getMessages(sessionId: string): Promise<Message[]> {
    const rows = await prisma.aIMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map(toLLMMessage)
  },

  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    await prisma.aISession.update({ where: { id: sessionId }, data: { title } })
  },
}
