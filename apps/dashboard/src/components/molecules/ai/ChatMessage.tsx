import ReactMarkdown from 'react-markdown'
import type { AIMessage } from '@merx/api-client'

const toolLabels: Record<string, string> = {
  get_analytics_overview: 'Analizez vânzările...',
  get_top_products: 'Analizez produsele...',
  get_inventory_status: 'Verific inventarul...',
  get_recent_orders: 'Verific comenzile recente...',
  get_order_details: 'Caut detalii comandă...',
}

interface ChatMessageProps {
  message: AIMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.role === 'tool' || message.role === 'system') return null

  if (message.role === 'assistant' && !message.content && message.toolCalls?.length) {
    return (
      <div className="flex gap-2 flex-wrap">
        {message.toolCalls.map((tc) => (
          <ToolCallPill key={tc.id} name={tc.name} done />
        ))}
      </div>
    )
  }

  if (!message.content) return null

  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-indigo-600 text-white rounded-br-sm'
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-sm',
        ].join(' ')}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownContent content={message.content} />
        )}
      </div>
    </div>
  )
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-1">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-bold mb-1.5 mt-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 text-gray-700 dark:text-gray-300">{children}</h3>,
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5 text-xs font-mono">{children}</code>,
        hr: () => <hr className="my-2 border-gray-200 dark:border-gray-700" />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

interface StreamingMessageProps {
  content: string
  activeTools: string[]
}

export function StreamingMessage({ content, activeTools }: StreamingMessageProps) {
  return (
    <div className="flex flex-col gap-2">
      {activeTools.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {activeTools.map((name, i) => (
            <ToolCallPill key={i} name={name} done={false} />
          ))}
        </div>
      )}
      {content && (
        <div className="flex justify-start">
          <div className="max-w-[78%] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed">
            <MarkdownContent content={content} />
            <span className="inline-block w-0.5 h-4 bg-indigo-500 animate-pulse ml-0.5 align-middle" />
          </div>
        </div>
      )}
    </div>
  )
}

function ToolCallPill({ name, done }: { name: string; done: boolean }) {
  const label = toolLabels[name] ?? name.replace(/_/g, ' ')
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        done
          ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800',
      ].join(' ')}
    >
      {!done && (
        <svg className="h-3 w-3 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {done && <span className="text-gray-400 dark:text-gray-500">✓</span>}
      {label}
    </span>
  )
}
