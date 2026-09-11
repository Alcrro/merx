import { useState } from 'react'
import { getEpicApp, APP_LABEL, TIER_LABEL } from '../../../hooks/useEpics'
import type { Epic, TaskNode, Tier, App } from '../../../hooks/useEpics'

function pct(done: number, total: number) {
  if (total === 0) return 0
  return Math.round((done / total) * 100)
}

const TIER_STYLES: Record<string, { badge: string; accent: string }> = {
  0: { badge: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400', accent: 'border-red-400' },
  1: { badge: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400', accent: 'border-yellow-400' },
  2: { badge: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400', accent: 'border-blue-400' },
  null: { badge: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400', accent: 'border-gray-400' },
}

function NodeTitle({ node }: { node: TaskNode }) {
  const inner = (
    <span className={`text-sm ${node.checked ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
      {node.number && <span className="text-xs text-gray-400 mr-1">#{node.number}</span>}
      {node.title}
    </span>
  )

  if (node.html_url) {
    return (
      <a href={node.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2">
        {inner}
      </a>
    )
  }
  return inner
}

function SubTaskRow({ node, isLast }: { node: TaskNode; isLast: boolean }) {
  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center mr-2 mt-1" style={{ width: 16 }}>
        <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700" style={{ minHeight: 8 }} />
        <div className={`w-2 h-px bg-gray-200 dark:bg-gray-700`} />
        {!isLast && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700" />}
      </div>
      <div className="flex items-center gap-2 py-0.5 flex-1 min-w-0">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-0.5 ${node.checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
        <NodeTitle node={node} />
      </div>
    </div>
  )
}

function TaskRow({ node, isLast }: { node: TaskNode; isLast: boolean }) {
  const hasChildren = node.children.length > 0

  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center mr-2" style={{ width: 16 }}>
        <div className="w-px bg-gray-200 dark:bg-gray-700" style={{ height: 12 }} />
        <div className="w-2 h-px bg-gray-200 dark:bg-gray-700" />
        {(!isLast || hasChildren) && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700" style={{ minHeight: hasChildren ? 0 : 8 }} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 py-1">
          <span className={`w-2 h-2 rounded-full shrink-0 ${node.checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
          <NodeTitle node={node} />
        </div>

        {hasChildren && (
          <div className="ml-2 mt-0.5 mb-1">
            {node.children.map((sub, i) => (
              <SubTaskRow key={sub.key} node={sub} isLast={i === node.children.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EpicCard({ epic, accent }: { epic: Epic; accent: string }) {
  const [open, setOpen] = useState(true)
  const epicPct = pct(epic.done, epic.total)
  const displayTitle = epic.title.replace(/^\[EPIC\]\s*/i, '')

  return (
    <div className={`rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 border-l-2 ${accent} overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition text-left"
      >
        <span className="text-gray-400 dark:text-gray-600 text-xs w-3 shrink-0">
          {open ? '▾' : '▸'}
        </span>

        <span className={`flex-1 text-sm font-medium ${epic.done === epic.total && epic.total > 0 ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'}`}>
          {displayTitle}
        </span>

        {epic.total > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-20 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
              <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${epicPct}%` }} />
            </div>
            <span className="text-xs text-gray-400 w-12 text-right">{epic.done}/{epic.total}</span>
          </div>
        )}

        <a
          href={epic.html_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-gray-300 dark:text-gray-700 hover:text-gray-500 text-xs shrink-0"
        >
          ↗
        </a>
      </button>

      {open && epic.children.length > 0 && (
        <div className="px-3 pb-2 pt-1 border-t border-gray-50 dark:border-gray-800/50">
          {epic.children.map((task, i) => (
            <TaskRow key={task.key} node={task} isLast={i === epic.children.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}

interface Props {
  tier: Tier | null
  epics: Epic[]
  filterApp: App | null
}

export function MvpTierSection({ tier, epics, filterApp }: Props) {
  const filtered = filterApp ? epics.filter(e => getEpicApp(e) === filterApp) : epics
  const totalDone = filtered.reduce((s, e) => s + e.done, 0)
  const totalTasks = filtered.reduce((s, e) => s + e.total, 0)
  const styles = TIER_STYLES[String(tier)]

  if (filtered.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.badge}`}>
            {tier !== null ? TIER_LABEL[tier] : 'Fără tier'}
          </span>
          <span className="text-xs text-gray-400">{pct(totalDone, totalTasks)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
            <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${pct(totalDone, totalTasks)}%` }} />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{totalDone}/{totalTasks}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {filtered.map(epic => (
          <EpicCard key={epic.id} epic={epic} accent={styles.accent} />
        ))}
      </div>
    </div>
  )
}
