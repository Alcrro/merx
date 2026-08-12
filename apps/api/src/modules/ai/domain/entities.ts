export interface AISessionEntity {
  id: string
  storeId: string
  userId: string
  title: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AIMessageEntity {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string | null
  toolCalls?: Array<{ id: string; name: string; arguments: Record<string, unknown> }>
  toolName: string | null
  createdAt: Date
}

export interface AISessionWithMessages extends AISessionEntity {
  messages: AIMessageEntity[]
}
