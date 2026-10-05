import { useEpics } from '../../hooks/useEpics'
import { useAllIssues } from '../../hooks/useDocIssues'
import { OverviewMvpSection } from '../../components/organisms/overview/OverviewMvpSection'
import { OverviewDecisionsSection } from '../../components/organisms/overview/OverviewDecisionsSection'

export function OverviewPage() {
  const { data: epics = [], isLoading: epicsLoading } = useEpics()
  const { data: allIssues = [], isLoading: issuesLoading } = useAllIssues()

  return (
    <div className="px-12 py-10 flex flex-col gap-10">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Overview</h1>
        <p className="text-sm text-gray-400 mt-0.5">Status curent al proiectului Merx</p>
      </div>
      <OverviewMvpSection epics={epics} isLoading={epicsLoading} />
      <OverviewDecisionsSection issues={allIssues} isLoading={issuesLoading} />
    </div>
  )
}
