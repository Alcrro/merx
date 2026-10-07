import type { Epic, TaskNode } from '../../../hooks/useEpics'

function pct(done: number, total: number) {
  if (total === 0) return 0
  return Math.round((done / total) * 100)
}

function NodeLink({ node }: { node: TaskNode }) {
  const text = (
    <span className={`text-sm ${node.checked ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
      {node.number && <span className="text-xs text-gray-400 mr-1.5">#{node.number}</span>}
      {node.title}
    </span>
  )
  if (node.html_url) {
    return <a href={node.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2">{text}</a>
  }
  return text
}

function SubRow({ node, isLast }: { node: TaskNode; isLast: boolean }) {
  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center mr-2 mt-1" style={{ width: 14 }}>
        <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700" style={{ minHeight: 8 }} />
        <div className="w-2 h-px bg-gray-200 dark:bg-gray-700" />
        {!isLast && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700" />}
      </div>
      <div className="flex items-center gap-2 py-0.5 flex-1 min-w-0">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-0.5 ${node.checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
        <NodeLink node={node} />
      </div>
    </div>
  )
}

function TaskRow({ node, isLast }: { node: TaskNode; isLast: boolean }) {
  const hasChildren = node.children.length > 0
  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center mr-2" style={{ width: 14 }}>
        <div className="w-px bg-gray-200 dark:bg-gray-700" style={{ height: 12 }} />
        <div className="w-2 h-px bg-gray-200 dark:bg-gray-700" />
        {(!isLast || hasChildren) && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700" style={{ minHeight: hasChildren ? 0 : 8 }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 py-1">
          <span className={`w-2 h-2 rounded-full shrink-0 ${node.checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
          <NodeLink node={node} />
        </div>
        {hasChildren && (
          <div className="ml-2 mt-0.5 mb-1">
            {node.children.map((sub, i) => (
              <SubRow key={sub.key} node={sub} isLast={i === node.children.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function EpicTaskTree({ epic }: { epic: Epic }) {
  if (epic.children.length === 0) return null

  return (
    <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tasks</h2>
        <div className="flex items-center gap-3">
          <div className="w-32 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all"
              style={{ width: `${pct(epic.done, epic.total)}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{epic.done}/{epic.total} · {pct(epic.done, epic.total)}%</span>
        </div>
      </div>
      <div className="flex flex-col">
        {epic.children.map((task, i) => (
          <TaskRow key={task.key} node={task} isLast={i === epic.children.length - 1} />
        ))}
      </div>
    </div>
  )
}
