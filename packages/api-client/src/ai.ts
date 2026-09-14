import { apiClient } from './client'

export interface AIInsight {
  id: string
  storeId: string
  type: 'trending_low_stock' | 'trending_stockout' | 'slow_overstock'
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string | null
  data: {
    productId: string
    productTitle: string
    velocityRecent: number
    velocityPrev: number
    trendPct: number
    totalStock: number
    runwayDays: number | null
    recommendedOrder: number
  } | null
  status: string
  createdAt: string
  resolvedAt: string | null
}

export interface AISession {
  id: string
  storeId: string
  userId: string
  title: string | null
  createdAt: string
  updatedAt: string
}

export interface AIMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string | null
  toolCalls?: Array<{ id: string; name: string; arguments: Record<string, unknown> }>
  toolName: string | null
  createdAt: string
}

export interface AISessionWithMessages extends AISession {
  messages: AIMessage[]
}

export type SSEChunk =
  | { type: 'tool_call'; name: string }
  | { type: 'text'; content: string }
  | { type: 'done' }
  | { type: 'error'; error: string }

export const aiApi = {
  createSession: (data: { title?: string }) =>
    apiClient.post<AISession>('/ai/sessions', data).then((r) => r.data),

  listSessions: () =>
    apiClient.get<AISession[]>('/ai/sessions').then((r) => r.data),

  getSession: (id: string) =>
    apiClient.get<AISessionWithMessages>(`/ai/sessions/${id}`).then((r) => r.data),

  deleteSession: (id: string) =>
    apiClient.delete(`/ai/sessions/${id}`),

  chat: (id: string, message: string) =>
    apiClient.post<{ reply: string }>(`/ai/sessions/${id}/chat`, { message }).then((r) => r.data),
}

export const insightsApi = {
  list: () =>
    apiClient.get<AIInsight[]>('/ai/sessions/insights').then((r) => r.data),

  run: () =>
    apiClient.post<{ generated: number }>('/ai/sessions/insights/run').then((r) => r.data),

  history: () =>
    apiClient.get<AIInsight[]>('/ai/sessions/insights/history').then((r) => r.data),

  restock: (insightId: string, quantity: number) =>
    apiClient
      .post<{ ok: boolean; updatedItems: number; totalAdded: number }>(
        `/ai/sessions/insights/${insightId}/restock`,
        { quantity }
      )
      .then((r) => r.data),
}

export async function streamAIMessage(
  sessionId: string,
  message: string,
  onChunk: (chunk: SSEChunk) => void,
  signal?: AbortSignal
): Promise<void> {
  const token = localStorage.getItem('merx_access')
  const response = await fetch(`/api/v1/ai/sessions/${sessionId}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
    signal,
  })

  if (!response.ok || !response.body) {
    onChunk({ type: 'error', error: `Request failed: ${response.status}` })
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const messages = buffer.split('\n\n')
    buffer = messages.pop() ?? ''

    for (const msg of messages) {
      const trimmed = msg.trim()
      if (!trimmed.startsWith('data: ')) continue
      try {
        const chunk = JSON.parse(trimmed.slice(6)) as SSEChunk
        onChunk(chunk)
      } catch {
        // ignore malformed chunk
      }
    }
  }
}
