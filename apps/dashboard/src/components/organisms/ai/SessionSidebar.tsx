import type { AISession } from '@merx/api-client'

interface SessionSidebarProps {
  sessions: AISession[]
  activeId: string | null
  isCreating: boolean
  onNewChat: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function SessionSidebar({
  sessions,
  activeId,
  isCreating,
  onNewChat,
  onSelect,
  onDelete,
}: SessionSidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col shrink-0">
      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={onNewChat}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950 px-3 py-2.5 text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition disabled:opacity-50"
        >
          <span className="text-lg leading-none">+</span>
          Conversație nouă
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        {sessions.length === 0 && (
          <p className="px-3 py-4 text-xs text-gray-400 dark:text-gray-500 text-center">
            Nicio conversație
          </p>
        )}
        {sessions.map((s) => (
          <SessionItem
            key={s.id}
            session={s}
            isActive={s.id === activeId}
            onSelect={() => onSelect(s.id)}
            onDelete={() => onDelete(s.id)}
          />
        ))}
      </div>
    </aside>
  )
}

interface SessionItemProps {
  session: AISession
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}

function SessionItem({ session, isActive, onSelect, onDelete }: SessionItemProps) {
  const title = session.title ?? 'Conversație nouă'
  const date = new Date(session.updatedAt).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <div
      className={[
        'group relative flex items-start gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition',
        isActive
          ? 'bg-indigo-50 dark:bg-indigo-950'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800',
      ].join(' ')}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <p
          className={[
            'text-sm truncate',
            isActive
              ? 'font-medium text-indigo-900 dark:text-indigo-300'
              : 'text-gray-700 dark:text-gray-300',
          ].join(' ')}
        >
          {title}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{date}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="opacity-0 group-hover:opacity-100 shrink-0 text-gray-300 dark:text-gray-600 hover:text-red-400 transition text-lg leading-none mt-0.5"
        title="Șterge conversația"
      >
        ×
      </button>
    </div>
  )
}
