import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ProductRequestStatus } from '@merx/api-client'
import { useMyRequests } from '../../hooks/useProductRequests'
import { Button } from '../../components/atoms/Button'
import { RequestProductModal } from '../../components/organisms/catalog/RequestProductModal'

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

function RequestStatusBadge({ status }: { status: ProductRequestStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export function ProductRequestsPage() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const { data: requests = [], isLoading } = useMyRequests()

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Cereri produse</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Urmărește statusul cererilor tale de produse noi.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>Cere produs nou</Button>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400 dark:text-gray-500">
            Se încarcă...
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Nu ai nicio cerere de produs.</p>
            <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
              Cere primul produs
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Produs solicitat</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Categorie</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Detalii</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Data cererii</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{req.requestedTitle}</p>
                    {req.description && (
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 line-clamp-1">
                        {req.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {req.category ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <RequestStatusBadge status={req.status} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {req.status === 'approved' && req.catalogProductId ? (
                      <button
                        className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs"
                        onClick={() => navigate(`/products/catalog`)}
                      >
                        Vezi în catalog →
                      </button>
                    ) : req.status === 'rejected' && req.rejectionReason ? (
                      <span className="text-xs text-red-500 dark:text-red-400 italic">
                        {req.rejectionReason}
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString('ro-RO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <RequestProductModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
