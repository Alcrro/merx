import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Epic, Tier } from '../../../hooks/useEpics'
import { TIERS, TIER_LABEL, getEpicTier, getEpicApp, APP_LABEL } from '../../../hooks/useEpics'

const PRIORITY_RE = /^P[1-4]$/i
const EXCLUDED = new Set([
  'api', 'dashboard', 'storefront', 'www',
  'database', 'email', 'queue', 'webhook', 'ui-component',
  'tier:0', 'tier:1', 'tier:2',
  'app:api', 'app:dashboard', 'app:storefront', 'app:www',
  'epic', 'mvp', 'docs', 'gap', 'decision', 'brainstorming',
])

function getEpicFeature(epic: Epic): string {
  const feature = epic.labels.find(l => !EXCLUDED.has(l.name) && !PRIORITY_RE.test(l.name))
  if (feature) return feature.name
  const app = getEpicApp(epic)
  return app ? APP_LABEL[app] : 'General'
}

function pct(done: number, total: number) {
  if (total === 0) return 0
  return Math.round((done / total) * 100)
}

const TIER_COLOR: Record<string, string> = {
  '0': 'bg-red-500',
  '1': 'bg-yellow-500',
  '2': 'bg-blue-500',
  'null': 'bg-gray-400',
}

const TIER_BADGE: Record<string, string> = {
  '0': 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400',
  '1': 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400',
  '2': 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
  'null': 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
}

interface FeatureGroup {
  name: string
  done: number
  total: number
  epics: Epic[]
}

interface TierBlock {
  tier: Tier | null
  done: number
  total: number
  features: FeatureGroup[]
}

function EpicRow({ epic }: { epic: Epic }) {
  const p = pct(epic.done, epic.total)
  const title = epic.title.replace(/^\[EPIC\]\s*/i, '')
  const app = getEpicApp(epic)
  const done = epic.done === epic.total && epic.total > 0

  const inner = (
    <div className="flex items-center gap-3 py-1 group">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${done ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
      <span className={`text-sm flex-1 min-w-0 truncate ${done ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'}`}>
        {title}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-20 bg-gray-100 dark:bg-gray-800 rounded-full h-1">
          <div className="bg-indigo-400 h-1 rounded-full transition-all" style={{ width: `${p}%` }} />
        </div>
        <span className="text-xs text-gray-400 w-8 text-right">{p}%</span>
      </div>
    </div>
  )

  if (app) {
    return <Link to={`/docs/${app}/${epic.number}`}>{inner}</Link>
  }
  return (
    <a href={epic.html_url} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  )
}

function FeatureBlock({ group, tierKey }: { group: FeatureGroup; tierKey: string }) {
  const p = pct(group.done, group.total)
  return (
    <div>
      <div className="flex items-center gap-3 py-1.5">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-32 shrink-0 truncate capitalize">
          {group.name}
        </span>
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all ${TIER_COLOR[tierKey]}`} style={{ width: `${p}%` }} />
        </div>
        <span className="text-xs text-gray-400 w-12 text-right shrink-0">{group.done}/{group.total}</span>
      </div>
      <div className="ml-2 pl-4 border-l border-gray-100 dark:border-gray-800">
        {group.epics.map(epic => (
          <EpicRow key={epic.id} epic={epic} />
        ))}
      </div>
    </div>
  )
}

function TierSection({ block }: { block: TierBlock }) {
  const key = String(block.tier)
  const p = pct(block.done, block.total)
  const label = block.tier !== null ? TIER_LABEL[block.tier] : 'Fără tier'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${TIER_BADGE[key]}`}>
          {label}
        </span>
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all ${TIER_COLOR[key]}`} style={{ width: `${p}%` }} />
        </div>
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-10 text-right shrink-0">{p}%</span>
        <span className="text-xs text-gray-400 w-12 shrink-0">{block.done}/{block.total}</span>
      </div>
      <div className="flex flex-col gap-1 ml-1">
        {block.features.map(f => (
          <FeatureBlock key={f.name} group={f} tierKey={key} />
        ))}
      </div>
    </div>
  )
}

interface Props {
  epics: Epic[]
  isLoading: boolean
}

export function OverviewMvpSection({ epics, isLoading }: Props) {
  const blocks = useMemo<TierBlock[]>(() => {
    const allTiers: (Tier | null)[] = [...TIERS, null]
    return allTiers
      .map(tier => {
        const tierEpics = epics.filter(e => getEpicTier(e) === tier)
        const featureMap = new Map<string, Epic[]>()
        for (const epic of tierEpics) {
          const feature = getEpicFeature(epic)
          const list = featureMap.get(feature) ?? []
          list.push(epic)
          featureMap.set(feature, list)
        }
        const features: FeatureGroup[] = Array.from(featureMap.entries()).map(([name, epicsInGroup]) => ({
          name,
          done: epicsInGroup.reduce((s, e) => s + e.done, 0),
          total: epicsInGroup.reduce((s, e) => s + e.total, 0),
          epics: epicsInGroup,
        }))
        return {
          tier,
          done: tierEpics.reduce((s, e) => s + e.done, 0),
          total: tierEpics.reduce((s, e) => s + e.total, 0),
          features,
        }
      })
      .filter(b => b.total > 0)
  }, [epics])

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">MVP Progress</h2>
        <Link to="/docs/mvp-status" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
          Detalii →
        </Link>
      </div>
      {isLoading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {blocks.map(block => (
            <TierSection key={String(block.tier)} block={block} />
          ))}
        </div>
      )}
    </section>
  )
}
