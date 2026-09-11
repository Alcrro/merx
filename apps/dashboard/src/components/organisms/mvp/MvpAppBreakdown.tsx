import { APPS, APP_LABEL } from '../../../hooks/useEpics'
import type { App } from '../../../hooks/useEpics'

function pct(closed: number, total: number) {
  if (total === 0) return 0
  return Math.round((closed / total) * 100)
}

interface AppStat {
  app: App
  total: number
  closed: number
}

export function MvpAppBreakdown({ byApp }: { byApp: AppStat[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-3">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pe aplicație</p>
      {byApp.map(({ app, total, closed }) => (
        <div key={app} className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400 w-24 shrink-0">{APP_LABEL[app]}</span>
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all"
              style={{ width: `${pct(closed, total)}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0">{closed}/{total}</span>
          <span className="text-xs text-gray-400 w-8 text-right shrink-0">{pct(closed, total)}%</span>
        </div>
      ))}
    </div>
  )
}
