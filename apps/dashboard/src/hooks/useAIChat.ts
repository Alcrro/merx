import { useState, useRef, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { streamAIMessage } from '@merx/api-client'
import { useSessions, useSession, useCreateSession, useDeleteSession, aiKeys } from './useAI'

export function useAIChat() {
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

  const clearStreamState = () => {
    setStreamContent('')
    setActiveTools([])
    setPendingUserMessage(null)
    setErrorMessage(null)
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
          if (chunk.type === 'tool_call') setActiveTools((prev) => [...prev, chunk.name])
          else if (chunk.type === 'text') setStreamContent((prev) => prev + chunk.content)
          else if (chunk.type === 'error') setErrorMessage(chunk.error)
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

  const handleNewChat = async (initialMessage?: string) => {
    const session = await createSession({})
    setActiveSessionId(session.id)
    clearStreamState()
    if (initialMessage) await handleSendWithSession(session.id, initialMessage)
  }

  const handleSelectSession = (id: string) => {
    if (isStreaming) abortRef.current?.abort()
    setActiveSessionId(id)
    clearStreamState()
  }

  const handleDeleteSession = async (id: string) => {
    await deleteSession(id)
    if (activeSessionId === id) {
      setActiveSessionId(null)
      clearStreamState()
    }
  }

  const handleSend = async (message: string) => {
    if (!activeSessionId || isStreaming) return
    await handleSendWithSession(activeSessionId, message)
  }

  const displayMessages = activeSession?.messages ?? []
  const lastAssistantContent =
    [...displayMessages].reverse().find((m) => m.role === 'assistant' && m.content)?.content ?? null

  return {
    sessions,
    activeSessionId,
    isCreating: isCreating || sessionsLoading,
    isStreaming,
    streamContent,
    activeTools,
    pendingUserMessage,
    errorMessage,
    bottomRef,
    displayMessages,
    lastAssistantContent,
    handleNewChat,
    handleSelectSession,
    handleDeleteSession,
    handleSend,
  }
}
