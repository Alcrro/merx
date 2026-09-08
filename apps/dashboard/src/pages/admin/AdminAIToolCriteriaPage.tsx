import { useState } from 'react'
import type { AIToolName } from '@merx/api-client'
import { useToolCriteria, useAddFollowUp, useDeleteFollowUp } from '../../hooks/useAIToolCriteria'
import { Button } from '../../components/atoms/Button'

const TOOLS: { value: AIToolName; label: string; description: string }[] = [
  { value: 'catalog-generator', label: 'Catalog Generator', description: 'Criterii pentru generarea de produse noi din cereri' },
  { value: 'moderation', label: 'Moderare conținut', description: 'Criterii pentru moderarea produselor din catalog' },
  { value: 'variant-classify', label: 'Clasificare variante', description: 'Criterii pentru clasificarea tipului de variantă' },
  { value: 'archive', label: 'Arhivare', description: 'Criterii pentru evaluarea produselor ce trebuie arhivate' },
]

function ToolCriteriaPanel({ toolName }: { toolName: AIToolName }) {
  const { data: criteria = [], isLoading } = useToolCriteria(toolName)
  const addFollowUp = useAddFollowUp(toolName)
  const deleteFollowUp = useDeleteFollowUp(toolName)

  const [newText, setNewText] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newText.trim()) return
    await addFollowUp.mutateAsync(newText.trim())
    setNewText('')
  }

  if (isLoading) {
    return <div className="py-6 text-sm text-gray-400 dark:text-gray-500 text-center">Se încarcă...</div>
  }

  return (
    <div className="space-y-3">
      {criteria.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">Niciun criteriu definit.</p>
      ) : (
        <ul className="space-y-2">
          {criteria.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 px-3 py-2">
              <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{c.followUpText}</p>
              {confirmDeleteId === c.id ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => setConfirmDeleteId(null)}>Anulează</button>
                  <button
                    className="text-xs text-red-500 dark:text-red-400 font-medium hover:underline"
                    onClick={async () => {
                      await deleteFollowUp.mutateAsync(c.id)
                      setConfirmDeleteId(null)
                    }}
                  >
                    Confirmă
                  </button>
                </div>
              ) : (
                <button
                  className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 shrink-0 transition"
                  onClick={() => setConfirmDeleteId(c.id)}
                >
                  Șterge
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex gap-2 mt-3">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Adaugă criteriu nou..."
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Button type="submit" size="sm" isLoading={addFollowUp.isPending} disabled={!newText.trim()}>
          Adaugă
        </Button>
      </form>
    </div>
  )
}

export function AdminAIToolCriteriaPage() {
  const [activeTool, setActiveTool] = useState<AIToolName>('catalog-generator')
  const activeToolMeta = TOOLS.find((t) => t.value === activeTool)!

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Admin — Criterii AI</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Follow-up-uri injectate în prompt-urile AI pentru fiecare tool.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.value}
              onClick={() => setActiveTool(tool.value)}
              className={[
                'w-full rounded-xl px-4 py-3 text-left transition',
                activeTool === tool.value
                  ? 'bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700',
              ].join(' ')}
            >
              <p className={`text-sm font-medium ${activeTool === tool.value ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {tool.label}
              </p>
              <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 line-clamp-2">{tool.description}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{activeToolMeta.label}</h2>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{activeToolMeta.description}</p>
          </div>
          <ToolCriteriaPanel key={activeTool} toolName={activeTool} />
        </div>
      </div>
    </div>
  )
}
