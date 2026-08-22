import { useAIChat } from '../../hooks/useAIChat'
import { SessionSidebar } from '../../components/organisms/ai/SessionSidebar'
import { ChatMessagesList } from '../../components/organisms/ai/ChatMessagesList'
import { ChatInputBar } from '../../components/organisms/ai/ChatInputBar'
import { ChatEmptyState } from '../../components/molecules/ai/ChatEmptyState'
import { SuggestedActions } from '../../components/molecules/ai/SuggestedActions'

export function AIChatPage() {
  const chat = useAIChat()

  return (
    <div className="-mx-6 -my-6 flex overflow-hidden" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <SessionSidebar
        sessions={chat.sessions}
        activeId={chat.activeSessionId}
        isCreating={chat.isCreating}
        onNewChat={chat.handleNewChat}
        onSelect={chat.handleSelectSession}
        onDelete={chat.handleDeleteSession}
      />

      <div className="flex flex-col flex-1 min-w-0 bg-gray-50 dark:bg-gray-950">
        {!chat.activeSessionId ? (
          <ChatEmptyState onPromptClick={(prompt) => chat.handleNewChat(prompt)} />
        ) : (
          <>
            <ChatMessagesList
              messages={chat.displayMessages}
              pendingUserMessage={chat.pendingUserMessage}
              isStreaming={chat.isStreaming}
              streamContent={chat.streamContent}
              activeTools={chat.activeTools}
              errorMessage={chat.errorMessage}
              bottomRef={chat.bottomRef}
            />
            {!chat.isStreaming && chat.lastAssistantContent && (
              <SuggestedActions lastAssistantMessage={chat.lastAssistantContent} />
            )}
            <ChatInputBar isDisabled={chat.isStreaming} onSend={chat.handleSend} />
          </>
        )}
      </div>
    </div>
  )
}
