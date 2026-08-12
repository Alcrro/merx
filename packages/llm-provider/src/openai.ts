import OpenAI from 'openai'
import type { LLMProvider, Message, ChatOptions, LLMResponse, LLMChunk, ToolCall } from './types'

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI
  private model: string

  constructor() {
    // Pass empty string to avoid SDK throwing at construction — validated at first call
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? '' })
    this.model = process.env.OPENAI_MODEL ?? 'gpt-4o'
  }

  async chat(messages: Message[], options: ChatOptions = {}): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: this.toOpenAIMessages(messages),
      tools: options.tools?.map((t) => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      })),
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? (Number(process.env.OPENAI_MAX_TOKENS) || 4096),
    })

    const choice = response.choices[0]
    const toolCalls: ToolCall[] = (choice.message.tool_calls ?? []).map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments) as Record<string, unknown>,
    }))

    return {
      content: choice.message.content,
      toolCalls: toolCalls.length ? toolCalls : undefined,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
          }
        : undefined,
    }
  }

  async *stream(messages: Message[], options: ChatOptions = {}): AsyncIterable<LLMChunk> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: this.toOpenAIMessages(messages),
      tools: options.tools?.map((t) => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      })),
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? (Number(process.env.OPENAI_MAX_TOKENS) || 4096),
      stream: true,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices.at(0)?.delta
      if (delta?.content) {
        yield { type: 'text', content: delta.content }
      }
    }

    yield { type: 'done' }
  }

  private toOpenAIMessages(messages: Message[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    return messages.map((m) => {
      if (m.role === 'tool') {
        return {
          role: 'tool' as const,
          content: m.content ?? '',
          tool_call_id: m.toolCallId ?? '',
        }
      }
      if (m.role === 'assistant' && m.toolCalls?.length) {
        return {
          role: 'assistant' as const,
          content: m.content,
          tool_calls: m.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.arguments),
            },
          })),
        }
      }
      return {
        role: m.role,
        content: m.content ?? '',
      }
    })
  }
}
