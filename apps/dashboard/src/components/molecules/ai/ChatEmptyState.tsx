import { PROMPT_CATEGORIES } from '../../../lib/ai.constants'

export function ChatEmptyState({ onPromptClick }: { onPromptClick: (prompt: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start gap-8 px-8 py-10">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900 text-2xl">
          🤖
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Agent Merx</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Analizez datele magazinului tău în timp real. Alege o întrebare sau scrie orice.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
        {PROMPT_CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {cat.label}
            </p>
            <div className="flex flex-col gap-2">
              {cat.prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onPromptClick(prompt)}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-800 dark:hover:text-indigo-300 transition shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
