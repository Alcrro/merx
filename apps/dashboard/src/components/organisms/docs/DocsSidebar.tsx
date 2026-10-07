import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getFeatureGroup, stripPrefix } from '../../../hooks/useDocIssues'
import type { GitHubDocIssue } from '../../../hooks/useDocIssues'

interface Group {
  name: string
  items: GitHubDocIssue[]
}

function buildGroups(issues: GitHubDocIssue[], section: string): Group[] {
  const HIGH_LEVEL = /^\[(EPIC|GAP|DECISION)\]/i
  const highLevel = issues.filter(i => HIGH_LEVEL.test(i.title))

  // Group by feature label
  const map = new Map<string, GitHubDocIssue[]>()
  for (const issue of highLevel) {
    const key = getFeatureGroup(issue, section)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(issue)
  }

  // Only show groups where at least one issue has the current section label
  return [...map.entries()]
    .filter(([, items]) => items.some(i => i.labels.some(l => l.name === section)))
    .sort(([a], [b]) => (a === 'general' ? 1 : b === 'general' ? -1 : a.localeCompare(b)))
    .map(([name, items]) => ({ name, items }))
}

function IssueTypeChip({ title }: { title: string }) {
  const match = /^\[([^\]]+)\]/.exec(title)
  if (!match) return null
  const type = match[1].toUpperCase()
  const colors: Record<string, string> = {
    EPIC: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400',
    GAP: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
    DECISION: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400',
  }
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${colors[type] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
      {type}
    </span>
  )
}

function SidebarGroup({ group, section }: { group: Group; section: string }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 transition"
      >
        <span className="truncate">{group.name}</span>
        <span className="ml-1 shrink-0">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="mt-0.5">
          {group.items.map(issue => (
            <NavLink
              key={issue.number}
              to={`/docs/${section}/${issue.number}`}
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition mb-0.5 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <IssueTypeChip title={issue.title} />
              <span className="truncate text-xs">{stripPrefix(issue.title)}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

interface Props {
  section: string
  issues: GitHubDocIssue[]
  loading: boolean
}

export function DocsSidebar({ section, issues, loading }: Props) {
  const groups = buildGroups(issues, section)

  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 dark:border-gray-800 min-h-[calc(100vh-3.5rem)] px-3 py-5 overflow-y-auto">
      {loading && (
        <div className="flex flex-col gap-2.5 px-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      )}

      {!loading && groups.length === 0 && (
        <p className="text-xs text-gray-400 px-2">
          Niciun EPIC/GAP/DECISION cu label <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{section}</code>
        </p>
      )}

      {!loading && groups.map(g => (
        <SidebarGroup key={g.name} group={g} section={section} />
      ))}
    </aside>
  )
}
