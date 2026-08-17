import { useState, useRef, type KeyboardEvent } from 'react'

interface ChatInputBarProps {
  isDisabled: boolean
  onSend: (message: string) => void
}

export function ChatInputBar({ isDisabled, onSend }: ChatInputBarProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || isDisabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
      <div className="flex items-end gap-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900 transition">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={isDisabled ? 'Agentul analizează...' : 'Întreabă-mă ceva despre magazinul tău...'}
          disabled={isDisabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={isDisabled || !value.trim()}
          className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isDisabled ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>
      <p className="mt-1.5 text-center text-xs text-gray-400 dark:text-gray-500">
        Enter pentru trimite · Shift+Enter pentru linie nouă
      </p>
    </div>
  )
}
