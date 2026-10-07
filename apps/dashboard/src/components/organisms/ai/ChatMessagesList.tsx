import type { RefObject } from 'react'
import type { AIMessage } from '@merx/api-client'
import { ChatMessage, StreamingMessage } from '../../molecules/ai/ChatMessage'

interface Props {
  messages: AIMessage[]
  pendingUserMessage: string | null
  isStreaming: boolean
  streamContent: string
  activeTools: string[]
  errorMessage: string | null
  bottomRef: RefObject<HTMLDivElement | null>
}

export function ChatMessagesList({
  messages,
  pendingUserMessage,
  isStreaming,
  streamContent,
  activeTools,
  errorMessage,
  bottomRef,
}: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
      {messages.length === 0 && !isStreaming && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">Trimite primul mesaj</p>
        </div>
      )}

      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}

      {pendingUserMessage && (
        <div className="flex justify-end">
          <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-3 text-sm leading-relaxed text-white">
            <p className="whitespace-pre-wrap">{pendingUserMessage}</p>
          </div>
        </div>
      )}

      {isStreaming && <StreamingMessage content={streamContent} activeTools={activeTools} />}

      {errorMessage && (
        <div className="flex justify-center">
          <p className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-2 text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
