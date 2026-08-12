import type { Message } from '@merx/llm-provider'
import type { AISessionEntity, AISessionWithMessages } from './entities'

export interface CreateSessionData {
  storeId: string
  userId: string
  title?: string
}

export interface IAIRepository {
  createSession(data: CreateSessionData): Promise<AISessionEntity>
  listSessions(storeId: string): Promise<AISessionEntity[]>
  getSession(sessionId: string, storeId: string): Promise<AISessionWithMessages | null>
  deleteSession(sessionId: string, storeId: string): Promise<void>
  saveMessages(sessionId: string, messages: Message[]): Promise<void>
  getMessages(sessionId: string): Promise<Message[]>
  updateSessionTitle(sessionId: string, title: string): Promise<void>
}
