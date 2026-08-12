import { useState, useRef, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { streamAIMessage } from '@merx/api-client'
import { useSessions, useSession, useCreateSession, useDeleteSession, aiKeys } from '../../hooks/useAI'
import { SessionSidebar } from '../../components/organisms/SessionSidebar'
import { ChatMessage, StreamingMessage } from '../../components/molecules/ChatMessage'
import { ChatInputBar } from '../../components/organisms/ChatInputBar'
import { SuggestedActions } from '../../components/molecules/SuggestedActions'

const EXAMPLE_PROMPTS = [
  'Care au fost cele mai bine vândute produse luna trecută?',
  'Am produse cu stoc epuizat sau critic?',
  'Cum arată vânzările față de luna trecută?',
  'Arată-mi comenzile neonorate din ultimele 7 zile.',
]

export function AIChatPage() {
  const qc = useQueryClient()
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const [activeTools, setActiveTools] = useState<string[]>([])
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: sessions = [], isLoading: sessionsLoading } = useSessions()
  const { data: activeSession } = useSession(activeSessionId)
  const { mutateAsync: createSession, isPending: isCreating } = useCreateSession()
  const { mutateAsync: deleteSession } = useDeleteSession()

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [activeSession?.messages, streamContent, activeTools, scrollToBottom])

  const handleNewChat = async (initialMessage?: string) => {
    const session = await createSession({})
    setActiveSessionId(session.id)
    setStreamContent('')
    setActiveTools([])
    setPendingUserMessage(null)
    setErrorMessage(null)
    if (initialMessage) {
      await handleSendWithSession(session.id, initialMessage)
    }
  }

  const handleSelectSession = (id: string) => {
    if (isStreaming) abortRef.current?.abort()
    setActiveSessionId(id)
    setStreamContent('')
    setActiveTools([])
    setPendingUserMessage(null)
    setErrorMessage(null)
  }

  const handleDeleteSession = async (id: string) => {
    await deleteSession(id)
    if (activeSessionId === id) {
      setActiveSessionId(null)
      setStreamContent('')
      setActiveTools([])
      setPendingUserMessage(null)
    }
  }

  const handleSendWithSession = async (sessionId: string, message: string) => {
    setErrorMessage(null)
    setPendingUserMessage(message)
    setStreamContent('')
    setActiveTools([])
    setIsStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      await streamAIMessage(
        sessionId,
        message,
        (chunk) => {
          if (chunk.type === 'tool_call') {
            setActiveTools((prev) => [...prev, chunk.name])
          } else if (chunk.type === 'text') {
            setStreamContent((prev) => prev + chunk.content)
          } else if (chunk.type === 'error') {
            setErrorMessage(chunk.error)
          }
        },
        controller.signal
      )
    } catch (err) {
      if ((err as { name?: string }).name !== 'AbortError') {
        setErrorMessage('A apărut o eroare. Încearcă din nou.')
      }
    } finally {
      setIsStreaming(false)
      setPendingUserMessage(null)
      setStreamContent('')
      setActiveTools([])
      abortRef.current = null
      await qc.invalidateQueries({ queryKey: aiKeys.session(sessionId) })
      await qc.invalidateQueries({ queryKey: aiKeys.sessions })
    }
  }

  const handleSend = async (message: string) => {
    if (!activeSessionId || isStreaming) return
    await handleSendWithSession(activeSessionId, message)
  }

  const displayMessages = activeSession?.messages ?? []

  const lastAssistantContent = [...displayMessages]
    .reverse()
    .find((m) => m.role === 'assistant' && m.content)?.content ?? null

  return (
    <div className="-mx-6 -my-6 flex overflow-hidden" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <SessionSidebar
        sessions={sessions}
        activeId={activeSessionId}
        isCreating={isCreating || sessionsLoading}
        onNewChat={handleNewChat}
        onSelect={handleSelectSession}
        onDelete={handleDeleteSession}
      />

      <div className="flex flex-col flex-1 min-w-0 bg-gray-50 dark:bg-gray-950">
        {!activeSessionId ? (
          <EmptyState onPromptClick={(prompt) => handleNewChat(prompt)} prompts={EXAMPLE_PROMPTS} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
              {displayMessages.length === 0 && !isStreaming && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">Trimite primul mesaj</p>
                </div>
              )}

              {displayMessages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {pendingUserMessage && (
                <div className="flex justify-end">
                  <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-3 text-sm leading-relaxed text-white">
                    <p className="whitespace-pre-wrap">{pendingUserMessage}</p>
                  </div>
                </div>
              )}

              {isStreaming && (
                <StreamingMessage content={streamContent} activeTools={activeTools} />
              )}

              {errorMessage && (
                <div className="flex justify-center">
                  <p className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-2 text-sm text-red-600 dark:text-red-400">
                    {errorMessage}
                  </p>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {!isStreaming && lastAssistantContent && (
              <SuggestedActions lastAssistantMessage={lastAssistantContent} />
            )}
            <ChatInputBar isDisabled={isStreaming} onSend={handleSend} />
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({
  prompts,
  onPromptClick,
}: {
  prompts: string[]
  onPromptClick: (prompt: string) => void
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900 text-2xl">
          🤖
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Agent Merx</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Analizez datele magazinului tău în timp real. Întreabă-mă orice despre vânzări, stocuri sau comenzi.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-xl w-full">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPromptClick(prompt)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-800 dark:hover:text-indigo-300 transition shadow-sm"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
