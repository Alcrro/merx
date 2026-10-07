import { useState } from 'react'
import { useCatalogCategories } from '../../../hooks/useCatalog'
import { useSubmitRequest } from '../../../hooks/useProductRequests'
import { Button } from '../../atoms/Button'

interface Props {
  onClose: () => void
}

export function RequestProductModal({ onClose }: Props) {
  const { data: categories = [] } = useCatalogCategories()
  const submitRequest = useSubmitRequest()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [titleError, setTitleError] = useState('')

  const flatCategories = [
    ...new Map(
      categories.flatMap((c) => [c, ...(c.children ?? [])]).map((c) => [c.id, c])
    ).values(),
  ]

  function validate() {
    if (title.trim().length < 2) {
      setTitleError('Titlul trebuie să aibă cel puțin 2 caractere.')
      return false
    }
    setTitleError('')
    return true
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return
    await submitRequest.mutateAsync({
      requestedTitle: title.trim(),
      category: category || null,
      description: description.trim() || null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Cere produs nou</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Denumire produs <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError('') }}
              placeholder="ex. Tricou oversize bumbac"
              className={[
                'rounded-lg border px-3 py-2 text-sm outline-none transition',
                'text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500',
                'focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                titleError
                  ? 'border-red-400 bg-red-50 dark:bg-red-950 dark:border-red-700'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800',
              ].join(' ')}
            />
            {titleError && <p className="text-xs text-red-500 dark:text-red-400">{titleError}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Fără categorie</option>
              {flatCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.parentId ? `  ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Descriere <span className="text-gray-400 font-normal">(opțional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Orice detalii relevante despre produs..."
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {submitRequest.isSuccess && (
            <p className="text-xs text-green-600 dark:text-green-400">
              Cererea a fost trimisă. Vei fi notificat când este procesată.
            </p>
          )}

          {submitRequest.isError && (
            <p className="text-xs text-red-500 dark:text-red-400">
              Eroare la trimitere. Încearcă din nou.
            </p>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" type="button" onClick={onClose}>
              Anulează
            </Button>
            <Button type="submit" isLoading={submitRequest.isPending}>
              Trimite cererea
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
