import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ProductStatus } from '@merx/types'
import { useProducts, useDeleteProduct } from '../../hooks/useProducts'
import { StatusBadge } from '../../components/atoms/Badge'
import { Button } from '../../components/atoms/Button'
import { ConfirmDialog } from '../../components/molecules/ConfirmDialog'

const STATUS_TABS: { label: string; value: ProductStatus | undefined }[] = [
  { label: 'Toate', value: undefined },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Arhivate', value: 'archived' },
]

const PAGE_SIZE = 20

export function ProductsListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<ProductStatus | undefined>()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data, isLoading } = useProducts({ status: statusFilter, page, limit: PAGE_SIZE })
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteProduct()

  const filtered = data?.data.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await deleteProduct(deletingId)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error
      alert(msg ?? 'Eroare la ștergere')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Produse</h1>
        <Button onClick={() => navigate('/products/new')}>+ Produs nou</Button>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => { setStatusFilter(tab.value); setPage(1) }}
              className={[
                'rounded-md px-3 py-1.5 text-sm transition',
                statusFilter === tab.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Caută produse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400 dark:text-gray-500">Se încarcă...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Niciun produs găsit.</p>
            <Button variant="ghost" onClick={() => navigate('/products/new')}>Creează primul produs</Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Titlu</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Variante</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Preț de la</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Creat</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((p) => {
                const minPrice = p.variants?.length
                  ? Math.min(...p.variants.map((v) => v.price))
                  : null
                return (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" onClick={() => navigate(`/products/${p.id}`)}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{p.title}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.variants?.length ?? 0}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {minPrice !== null ? minPrice.toFixed(2) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="text-xs text-red-500 dark:text-red-400 hover:underline"
                        onClick={() => setDeletingId(p.id)}
                      >
                        Șterge
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">{page} / {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Următor →
          </button>
        </div>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Șterge produs"
          message="Această acțiune este permanentă. Produsele cu comenzi asociate nu pot fi șterse — arhivează-le în schimb."
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  )
}
