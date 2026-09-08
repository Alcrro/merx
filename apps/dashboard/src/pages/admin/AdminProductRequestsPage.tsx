import { useState } from 'react'
import type { ProductRequestStatus } from '@merx/api-client'
import type { DuplicateCluster } from '@merx/api-client'
import { useAdminRequests, useApproveRequest, useRejectRequest, useRetryRequest, useAnalyzeDuplicates, useBulkRejectRequests } from '../../hooks/useProductRequests'
import { Button } from '../../components/atoms/Button'

const STATUS_LABELS: Record<ProductRequestStatus, string> = {
  pending: 'În așteptare',
  ai_processing: 'Procesare AI',
  admin_review: 'Review admin',
  approved: 'Aprobat',
  rejected: 'Respins',
}

const STATUS_STYLES: Record<ProductRequestStatus, string> = {
  pending: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  ai_processing: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  admin_review: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
  approved: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
  rejected: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
}

const FILTER_OPTIONS: { label: string; value: ProductRequestStatus | undefined }[] = [
  { label: 'Toate', value: undefined },
  { label: 'Review admin', value: 'admin_review' },
  { label: 'Pending', value: 'pending' },
  { label: 'AI processing', value: 'ai_processing' },
  { label: 'Aprobate', value: 'approved' },
  { label: 'Respinse', value: 'rejected' },
]

export function AdminProductRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<ProductRequestStatus | undefined>('admin_review')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [clusters, setClusters] = useState<DuplicateCluster[] | null>(null)

  const { data: requests = [], isLoading } = useAdminRequests(statusFilter)
  const approve = useApproveRequest()
  const reject = useRejectRequest()
  const retry = useRetryRequest()
  const analyzeDuplicates = useAnalyzeDuplicates()
  const bulkReject = useBulkRejectRequests()

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Admin — Cereri produse</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Aprobă sau respinge cererile de produse noi.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          isLoading={analyzeDuplicates.isPending}
          onClick={async () => {
            const result = await analyzeDuplicates.mutateAsync()
            setClusters(result)
          }}
        >
          Analizează duplicate (AI)
        </Button>
      </div>

      {clusters !== null && (
        <div className="mb-6 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {clusters.length === 0
                ? 'Niciun duplicat semantic detectat.'
                : `${clusters.length} grup${clusters.length > 1 ? 'uri' : ''} de duplicate detectat${clusters.length > 1 ? 'e' : ''}`}
            </p>
            <div className="flex items-center gap-3">
              {clusters.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                  isLoading={bulkReject.isPending}
                  onClick={async () => {
                    const allDuplicateIds = clusters.flatMap((c) => c.duplicates.map((d) => d.id))
                    await bulkReject.mutateAsync({ ids: allDuplicateIds, rejectionReason: 'Duplicat detectat automat de AI' })
                    setClusters(null)
                  }}
                >
                  Respinge toate duplicatele
                </Button>
              )}
              <button
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => setClusters(null)}
              >
                Închide
              </button>
            </div>
          </div>
          {clusters.map((cluster, i) => (
            <div key={i} className="mb-3 last:mb-0 rounded-xl border border-amber-100 dark:border-amber-800/60 bg-white dark:bg-gray-900 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Canonical (se păstrează)</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{cluster.canonical.title}</p>
                  <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Duplicate (se resping)</p>
                  <ul className="space-y-0.5">
                    {cluster.duplicates.map((d) => (
                      <li key={d.id} className="text-sm text-red-600 dark:text-red-400">{d.title}</li>
                    ))}
                  </ul>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0"
                  isLoading={bulkReject.isPending}
                  onClick={async () => {
                    const ids = cluster.duplicates.map((d) => d.id)
                    await bulkReject.mutateAsync({ ids, rejectionReason: 'Duplicat detectat automat de AI' })
                    setClusters((prev) => prev?.filter((_, idx) => idx !== i) ?? null)
                  }}
                >
                  Respinge
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 w-fit">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setStatusFilter(opt.value)}
            className={[
              'rounded-md px-3 py-1.5 text-sm transition whitespace-nowrap',
              statusFilter === opt.value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400 dark:text-gray-500">Se încarcă...</div>
        ) : requests.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-500 dark:text-gray-400">Nicio cerere.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Produs solicitat</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Categorie</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Duplicate</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Dată</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{req.requestedTitle}</p>
                    {req.description && (
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 line-clamp-1">{req.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{req.category ?? '—'}</td>
                  <td className="px-4 py-3 tabular-nums text-gray-500 dark:text-gray-400">
                    {req.duplicateCount ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">{req.duplicateCount}×</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[req.status]}`}>
                      {STATUS_LABELS[req.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString('ro-RO')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {rejectingId === req.id ? (
                      <div className="flex flex-col items-end gap-2">
                        <input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Motiv respingere (opțional)"
                          className="w-48 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <div className="flex gap-2">
                          <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => { setRejectingId(null); setRejectReason('') }}>Anulează</button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 dark:text-red-400"
                            isLoading={reject.isPending}
                            onClick={async () => {
                              await reject.mutateAsync({ id: req.id, rejectionReason: rejectReason || undefined })
                              setRejectingId(null)
                              setRejectReason('')
                            }}
                          >
                            Confirmă
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-3">
                        {(req.status === 'pending' || req.status === 'ai_processing') && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                              isLoading={retry.isPending}
                              onClick={() => retry.mutate(req.id)}
                            >
                              Reprocessează
                            </Button>
                            <button className="text-xs text-red-500 dark:text-red-400 hover:underline" onClick={() => setRejectingId(req.id)}>Respinge</button>
                          </>
                        )}
                        {req.status === 'admin_review' && (
                          <>
                            <button className="text-xs text-red-500 dark:text-red-400 hover:underline" onClick={() => setRejectingId(req.id)}>Respinge</button>
                            <Button
                              size="sm"
                              isLoading={approve.isPending && approvingId === req.id}
                              onClick={async () => {
                                setApprovingId(req.id)
                                await approve.mutateAsync(req.id)
                                setApprovingId(null)
                              }}
                            >
                              Aprobă
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
