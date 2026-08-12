export interface Message {
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string | null
  toolCallId?: string
  toolCalls?: ToolCall[]
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface Tool {
  name: string
  description: string
  parameters: Record<string, unknown> // JSON Schema
}

export interface LLMResponse {
  content: string | null
  toolCalls?: ToolCall[]
  usage?: {
    promptTokens: number
    completionTokens: number
  }
}

export interface LLMChunk {
  type: 'text' | 'tool_call' | 'done'
  content?: string
  toolCall?: ToolCall
}

export interface ChatOptions {
  tools?: Tool[]
  temperature?: number
  maxTokens?: number
}

export interface LLMProvider {
  chat(messages: Message[], options?: ChatOptions): Promise<LLMResponse>
  stream(messages: Message[], options?: ChatOptions): AsyncIterable<LLMChunk>
}
