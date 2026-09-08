import { useState } from 'react'
import {
  useArchiveCriteria,
  useCreateArchiveCriteria,
  useDeleteArchiveCriteria,
  useRunArchiveCriteria,
} from '../../hooks/useCatalog'
import { Button } from '../../components/atoms/Button'

const CRITERIA_TYPES = [
  { value: 'never_added_to_store', label: 'Niciodată adăugat în store' },
  { value: 'no_active_variants', label: 'Fără variante active' },
  { value: 'rejected_requests', label: 'Cereri respinse' },
  { value: 'no_sales_months', label: 'Fără vânzări (luni)' },
  { value: 'low_rating', label: 'Rating scăzut' },
]

export function AdminArchiveCriteriaPage() {
  const { data: criteria = [], isLoading } = useArchiveCriteria()
  const createCriteria = useCreateArchiveCriteria()
  const deleteCriteria = useDeleteArchiveCriteria()
  const runCriteria = useRunArchiveCriteria()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [criteriaType, setCriteriaType] = useState('never_added_to_store')
  const [thresholdValue, setThresholdValue] = useState('')
  const [runResult, setRunResult] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await createCriteria.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      criteriaType,
      thresholdValue: thresholdValue ? parseFloat(thresholdValue) : undefined,
    })
    setName('')
    setDescription('')
    setCriteriaType('never_added_to_store')
    setThresholdValue('')
    setShowForm(false)
  }

  async function handleRun() {
    const result = await runCriteria.mutateAsync()
    setRunResult(result.archived)
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Admin — Criterii arhivare</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Gestionează regulile de arhivare automată a produselor din catalog.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {runResult !== null && (
            <span className="text-sm text-green-600 dark:text-green-400">
              {runResult} produse arhivate
            </span>
          )}
          <Button
            variant="outline"
            isLoading={runCriteria.isPending}
            onClick={handleRun}
          >
            Rulează acum
          </Button>
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Anulează' : '+ Criteriu nou'}
          </Button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex flex-col gap-4"
        >
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Criteriu nou</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nume *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex. Niciodată adăugat"
                required
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tip criteriu</label>
              <select
                value={criteriaType}
                onChange={(e) => setCriteriaType(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CRITERIA_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descriere</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Opțional"
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Valoare prag</label>
              <input
                type="number"
                value={thresholdValue}
                onChange={(e) => setThresholdValue(e.target.value)}
                placeholder="ex. 6 (luni)"
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Anulează</Button>
            <Button type="submit" isLoading={createCriteria.isPending}>Salvează criteriu</Button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400 dark:text-gray-500">Se încarcă...</div>
        ) : criteria.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-500 dark:text-gray-400">
            Niciun criteriu definit.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Nume</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Tip</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Prag</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Activ</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {criteria.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{c.name}</p>
                    {c.description && (
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{c.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">
                    {c.criteriaType}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-gray-500 dark:text-gray-400">
                    {c.thresholdValue ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.isActive ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                      {c.isActive ? 'Activ' : 'Inactiv'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmDeleteId === c.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => setConfirmDeleteId(null)}>Anulează</button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 dark:text-red-400"
                          isLoading={deleteCriteria.isPending}
                          onClick={async () => {
                            await deleteCriteria.mutateAsync(c.id)
                            setConfirmDeleteId(null)
                          }}
                        >
                          Confirmă
                        </Button>
                      </div>
                    ) : (
                      <button
                        className="text-xs text-red-500 dark:text-red-400 hover:underline"
                        onClick={() => setConfirmDeleteId(c.id)}
                      >
                        Șterge
                      </button>
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
