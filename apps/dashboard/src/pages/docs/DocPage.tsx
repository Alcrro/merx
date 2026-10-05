import { useParams, Navigate } from 'react-router-dom'
import { useAllIssues } from '../../hooks/useDocIssues'
import { DocViewer } from '../../components/organisms/docs/DocViewer'
import { DocsSidebar } from '../../components/organisms/docs/DocsSidebar'
import { MvpTokenInput } from '../../components/organisms/mvp/MvpTokenInput'

const HIGH_LEVEL = /^\[(EPIC|GAP|DECISION)\]/i

export function DocPage() {
  const { section = '', issueNumber } = useParams<{ section: string; issueNumber?: string }>()
  const { data: allIssues, isLoading, error } = useAllIssues()

  if (error) return <MvpTokenInput error={error.message} />

  const firstSectionHighLevel = allIssues?.find(
    i => HIGH_LEVEL.test(i.title) && i.labels.some(l => l.name === section)
  )

  const selected = issueNumber
    ? allIssues?.find(i => i.number === parseInt(issueNumber, 10))
    : firstSectionHighLevel

  if (!issueNumber && !isLoading && firstSectionHighLevel) {
    return <Navigate to={`/docs/${section}/${firstSectionHighLevel.number}`} replace />
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <DocsSidebar section={section} issues={allIssues ?? []} loading={isLoading} />

      <div className="flex-1 min-w-0 px-12 py-10">
        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && !selected && (
          <p className="text-sm text-gray-400 text-center mt-16">Selectează un issue din sidebar</p>
        )}

        {selected && (
          <>
            <div className="flex items-start justify-between mb-8 gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{selected.title}</h1>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selected.labels.map(l => (
                    <span key={l.name} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      {l.name}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href={selected.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 mt-1"
              >
                GitHub ↗
              </a>
            </div>

            {selected.body
              ? <DocViewer content={selected.body} />
              : <p className="text-sm text-gray-400 italic">Niciun body pe acest issue.</p>
            }
          </>
        )}
      </div>
    </div>
  )
}
