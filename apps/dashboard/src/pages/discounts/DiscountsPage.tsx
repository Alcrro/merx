import { useState } from 'react'
import { useDiscounts, useCreateDiscount, useUpdateDiscount, useDeleteDiscount } from '../../hooks/useDiscounts'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/atoms/Button'
import { DiscountStatusBadge } from '../../components/molecules/discounts/DiscountStatusBadge'
import { ConfirmDialog } from '../../components/molecules/shared/ConfirmDialog'
import { CreateDiscountForm } from '../../components/organisms/discounts/CreateDiscountForm'
import { formatMoney, formatPercent } from '../../lib/format'
import { DISCOUNT_TYPE_LABELS } from '../../lib/discounts.constants'
import type { CreateDiscountInput, DiscountCode } from '@merx/api-client'

const PAGE_SIZE = 20

export function DiscountsPage() {
  const { store } = useAuth()
  const currency = store?.currency ?? 'EUR'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [deletingCode, setDeletingCode] = useState<DiscountCode | null>(null)

  const { data, isLoading } = useDiscounts({ page, limit: PAGE_SIZE, search: search || undefined })
  const { mutateAsync: createDiscount, isPending: isCreating } = useCreateDiscount()
  const { mutateAsync: deleteDiscount, isPending: isDeleting } = useDeleteDiscount()

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  const handleCreate = async (input: CreateDiscountInput) => {
    await createDiscount(input)
    setShowForm(false)
  }

  const handleDelete = async () => {
    if (!deletingCode) return
    try {
      await deleteDiscount(deletingCode.id)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error
      alert(msg ?? 'Eroare la ștergere')
    } finally {
      setDeletingCode(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Coduri reducere</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {data ? `${data.total} coduri` : '—'}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Cod nou</Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
            <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-gray-100">Cod reducere nou</h2>
            <CreateDiscountForm
              currency={currency}
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              isLoading={isCreating}
            />
          </div>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Caută cod..."
          value={search}
          onChange={(e) => { setSearch(e.target.value.toUpperCase()); setPage(1) }}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">Se încarcă...</div>
        ) : !data?.data.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Niciun cod de reducere creat.</p>
            <Button variant="ghost" onClick={() => setShowForm(true)}>Creează primul cod</Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Cod</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Tip</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Valoare</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Utilizări</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Expiră</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {data.data.map((dc) => (
                <DiscountRow
                  key={dc.id}
                  discount={dc}
                  currency={currency}
                  onDelete={() => setDeletingCode(dc)}
                />
              ))}
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

      {deletingCode && (
        <ConfirmDialog
          title="Șterge cod reducere"
          message={
            deletingCode.usedCount > 0
              ? `Codul ${deletingCode.code} a fost folosit de ${deletingCode.usedCount} ori. Va fi ascuns, dar istoricul comenzilor se păstrează.`
              : `Ești sigur că vrei să ștergi codul ${deletingCode.code}?`
          }
          confirmLabel="Șterge"
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeletingCode(null)}
        />
      )}
    </div>
  )
}

// Separate component so useUpdateDiscount hook is called at component level
function DiscountRow({
  discount: dc,
  currency,
  onDelete,
}: {
  discount: DiscountCode
  currency: string
  onDelete: () => void
}) {
  const { mutateAsync: updateDiscount, isPending: isToggling } = useUpdateDiscount(dc.id)

  const handleToggle = async () => {
    try {
      await updateDiscount({ isActive: !dc.isActive })
    } catch {
      // list refetches on invalidation — real state restored automatically
    }
  }

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-gray-100">{dc.code}</td>
      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{DISCOUNT_TYPE_LABELS[dc.type]}</td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
        {dc.type === 'percentage' ? formatPercent(dc.value) : formatMoney(dc.value, currency)}
      </td>
      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
        {dc.usedCount}
        {dc.maxUses !== null ? ` / ${dc.maxUses}` : <span className="ml-1 text-xs text-gray-400">nelimitat</span>}
      </td>
      <td className="px-4 py-3">
        <DiscountStatusBadge
          isActive={dc.isActive}
          startsAt={dc.startsAt}
          expiresAt={dc.expiresAt}
          usedCount={dc.usedCount}
          maxUses={dc.maxUses}
        />
      </td>
      <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
        {dc.expiresAt ? new Date(dc.expiresAt).toLocaleDateString('ro-RO') : '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-3">
          <button
            disabled={isToggling}
            onClick={handleToggle}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-40"
          >
            {dc.isActive ? 'Dezactivează' : 'Activează'}
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-red-500 dark:text-red-400 hover:underline"
          >
            Șterge
          </button>
        </div>
      </td>
    </tr>
  )
}
