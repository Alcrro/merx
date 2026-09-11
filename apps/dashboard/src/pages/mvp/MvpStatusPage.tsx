import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEpics, getEpicTier, getEpicApp, APPS, TIERS, APP_LABEL } from '../../hooks/useEpics'
import type { App, Tier, Epic } from '../../hooks/useEpics'
import { MvpTokenInput } from '../../components/organisms/mvp/MvpTokenInput'
import { MvpSummaryCards } from '../../components/organisms/mvp/MvpSummaryCards'
import { MvpAppBreakdown } from '../../components/organisms/mvp/MvpAppBreakdown'
import { MvpTierSection } from '../../components/organisms/mvp/MvpTierSection'

const FILTER_TABS = [{ label: 'Toate', value: null }, ...APPS.map(a => ({ label: APP_LABEL[a], value: a }))] as const

export function MvpStatusPage() {
  const { data: epics, isLoading, error, dataUpdatedAt } = useEpics()
  const [searchParams] = useSearchParams()
  const [filterApp, setFilterApp] = useState<App | null>(null)

  useEffect(() => {
    const app = searchParams.get('app') as App | null
    setFilterApp(app && APPS.includes(app) ? app : null)
  }, [searchParams])

  const stats = useMemo(() => {
    if (!epics) return null
    const totalTasks = epics.reduce((s, e) => s + e.total, 0)
    const doneTasks = epics.reduce((s, e) => s + e.done, 0)
    const byApp = APPS.map(app => {
      const appEpics = epics.filter(e => getEpicApp(e) === app)
      return {
        app,
        total: appEpics.reduce((s, e) => s + e.total, 0),
        closed: appEpics.reduce((s, e) => s + e.done, 0),
      }
    })
    return { total: totalTasks, closed: doneTasks, open: totalTasks - doneTasks, byApp }
  }, [epics])

  const epicsByTier = useMemo(() => {
    if (!epics) return {} as Record<Tier, Epic[]>
    return Object.fromEntries(
      TIERS.map(tier => [tier, epics.filter(e => getEpicTier(e) === tier)])
    ) as Record<Tier, Epic[]>
  }, [epics])

  const untieredEpics = useMemo(
    () => epics?.filter(e => getEpicTier(e) === null) ?? [],
    [epics]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Fetch din GitHub...</p>
        </div>
      </div>
    )
  }

  if (error) return <MvpTokenInput error={error.message} />
  if (!stats || !epics) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">MVP Status</h1>
          {dataUpdatedAt > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">Sync: {new Date(dataUpdatedAt).toLocaleString('ro-RO')}</p>
          )}
        </div>
        <a
          href={`https://github.com/${import.meta.env.VITE_GITHUB_REPO ?? 'alcrro/merx'}/issues`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          GitHub Issues ↗
        </a>
      </div>

      <MvpSummaryCards total={stats.total} closed={stats.closed} open={stats.open} />
      <MvpAppBreakdown byApp={stats.byApp} />

      <div className="flex gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 w-fit">
        {FILTER_TABS.map(tab => (
          <button
            key={String(tab.value)}
            onClick={() => setFilterApp(tab.value as App | null)}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              filterApp === tab.value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {TIERS.map(tier => (
          <MvpTierSection key={tier} tier={tier} epics={epicsByTier[tier] ?? []} filterApp={filterApp} />
        ))}
        {untieredEpics.length > 0 && (
          <MvpTierSection tier={null} epics={untieredEpics} filterApp={filterApp} />
        )}
      </div>
    </div>
  )
}
