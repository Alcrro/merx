import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { GitHubDocIssue } from '../../../hooks/useDocIssues'

const DECISION_RE = /^\[DECISION\]/i
const PRIORITY_RE = /^P[1-4]$/i
const SECTION_LABELS = ['decisions', 'api', 'dashboard', 'storefront', 'www', 'engineering']
const EXCLUDED = new Set([
  'api', 'dashboard', 'storefront', 'www', 'decisions', 'engineering',
  'database', 'email', 'queue', 'webhook', 'ui-component',
  'tier:0', 'tier:1', 'tier:2',
  'app:api', 'app:dashboard', 'app:storefront', 'app:www',
  'epic', 'mvp', 'docs', 'gap', 'decision', 'brainstorming',
])

const TIME_WINDOWS = [
  { label: '24h', hours: 24 },
  { label: '3 zile', hours: 72 },
  { label: '7 zile', hours: 168 },
] as const

function getDecisionSection(issue: GitHubDocIssue): string {
  for (const s of SECTION_LABELS) {
    if (issue.labels.some(l => l.name === s)) return s
  }
  return 'decisions'
}

function DecisionCard({ issue }: { issue: GitHubDocIssue }) {
  const title = issue.title.replace(DECISION_RE, '').trim()
  const section = getDecisionSection(issue)
  const appLabels = issue.labels
    .filter(l => ['api', 'dashboard', 'storefront', 'www'].includes(l.name))
    .map(l => l.name)
  const featureLabels = issue.labels
    .filter(l => !EXCLUDED.has(l.name) && !PRIORITY_RE.test(l.name))
    .map(l => l.name)

  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <span className={`text-sm ${issue.state === 'closed' ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'}`}>
          {title}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {appLabels.map(l => (
            <span key={l} className="text-xs px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              {l}
            </span>
          ))}
          {featureLabels.map(l => (
            <span key={l} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              {l}
            </span>
          ))}
          <span className="text-xs text-gray-400">
            {new Date(issue.updated_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
      <Link
        to={`/docs/${section}/${issue.number}`}
        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 mt-0.5 whitespace-nowrap"
      >
        Go to →
      </Link>
    </div>
  )
}

interface Props {
  issues: GitHubDocIssue[]
  isLoading: boolean
}

export function OverviewDecisionsSection({ issues, isLoading }: Props) {
  const [windowHours, setWindowHours] = useState(24)

  const decisions = useMemo(() => {
    const cutoff = Date.now() - windowHours * 60 * 60 * 1000
    return issues
      .filter(i => DECISION_RE.test(i.title) && new Date(i.updated_at).getTime() >= cutoff)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [issues, windowHours])

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Decisions</h2>
        <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          {TIME_WINDOWS.map(w => (
            <button
              key={w.hours}
              onClick={() => setWindowHours(w.hours)}
              className={`text-xs px-2.5 py-1 rounded-md transition ${
                windowHours === w.hours
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-20 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : decisions.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">
          Nicio decizie actualizată în ultimele {windowHours === 24 ? '24 de ore' : windowHours === 72 ? '3 zile' : '7 zile'}
        </p>
      ) : (
        <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4">
          {decisions.map(d => (
            <DecisionCard key={d.id} issue={d} />
          ))}
        </div>
      )}
    </section>
  )
}
